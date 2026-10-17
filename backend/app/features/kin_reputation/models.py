"""
Database models and enums for the Kin Reputation & Contribution Ledger Engine.
Provides an immutable ledger, configurable points policy, member reputation summary,
and audit trails for anti-abuse and reversal operations.
"""

import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def utc_now():
    return datetime.now(timezone.utc)


def to_utc(dt):
    """Normalize offset-naive and offset-aware datetimes to UTC."""
    if dt is None:
        return None
    if getattr(dt, "tzinfo", None) is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)



class ContributionEventType(str, enum.Enum):
    MENTORING_SESSION = "mentoring_session"
    PORTFOLIO_FEEDBACK = "portfolio_feedback"
    MOCK_INTERVIEW = "mock_interview"
    COMMUNITY_ANSWER = "community_answer"
    TWENTY_MINUTE_DOORWAY = "twenty_minute_doorway"
    SUCCESSFUL_INTRODUCTION = "successful_introduction"
    WISDOM_CAPSULE = "wisdom_capsule"
    POSITIVE_FEEDBACK = "positive_feedback"
    MANUAL_ADJUSTMENT = "manual_adjustment"
    DISPUTE_REVERSAL = "dispute_reversal"


class VerificationStatus(str, enum.Enum):
    VERIFIED = "verified"
    PENDING_REVIEW = "pending_review"
    REJECTED = "rejected"
    REVERSED = "reversed"


class ReputationTier(str, enum.Enum):
    BRONZE = "Bronze"       # 0 - 99
    SILVER = "Silver"       # 100 - 299
    GOLD = "Gold"           # 300 - 699
    PLATINUM = "Platinum"   # 700 - 1499
    FELLOW = "Fellow"       # 1500+


class AbuseFlagSeverity(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    FLAGGED = "flagged"
    BLOCKED = "blocked"


def calculate_tier_from_points(points: int) -> str:
    """Deterministic tier mapping based on reputation points."""
    if points >= 1500:
        return ReputationTier.FELLOW.value
    elif points >= 700:
        return ReputationTier.PLATINUM.value
    elif points >= 300:
        return ReputationTier.GOLD.value
    elif points >= 100:
        return ReputationTier.SILVER.value
    return ReputationTier.BRONZE.value


class KinPointsPolicy(Base):
    """
    Server-side configurable contribution points policy.
    Governs point values, daily caps, cooldowns, and verification requirements.
    """
    __tablename__ = "kin_points_policies"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(60), unique=True, index=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    base_points = Column(Integer, nullable=False)
    daily_cap = Column(Integer, nullable=False, default=100)
    cooldown_seconds = Column(Integer, nullable=False, default=300)
    requires_counterparty = Column(Boolean, default=False, nullable=False)
    requires_verification = Column(Boolean, default=True, nullable=False)
    min_quality_score = Column(Float, default=0.0, nullable=False)
    policy_version = Column(String(20), default="v1.0", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class KinReputationSummary(Base):
    """
    Aggregated reputation summary for a community member.
    Separates lifetime earned points, net balance, rolling windows, and category breakdowns.
    """
    __tablename__ = "kin_reputation_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)

    lifetime_points = Column(Integer, default=0, nullable=False)
    total_adjustments = Column(Integer, default=0, nullable=False)
    current_points = Column(Integer, default=0, nullable=False)
    rolling_30d_points = Column(Integer, default=0, nullable=False)
    rolling_90d_points = Column(Integer, default=0, nullable=False)
    tier = Column(String(30), default=ReputationTier.BRONZE.value, nullable=False)
    verified_contributions_count = Column(Integer, default=0, nullable=False)
    category_breakdown = Column(JSON, default=dict, nullable=False)
    last_activity_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="kin_reputation_summary")


class KinLedgerEntry(Base):
    """
    Append-only immutable contribution ledger.
    Every contribution, reversal, and adjustment is recorded as an indelible row.
    """
    __tablename__ = "kin_ledger_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    event_type = Column(String(60), index=True, nullable=False)
    source_reference = Column(String(255), index=True, nullable=False)
    idempotency_key = Column(String(255), unique=True, index=True, nullable=False)
    points = Column(Integer, nullable=False)
    policy_version = Column(String(20), default="v1.0", nullable=False)
    verification_status = Column(String(30), default=VerificationStatus.VERIFIED.value, nullable=False)
    
    # Linked reversal relationship
    reversal_of_entry_id = Column(Integer, ForeignKey("kin_ledger_entries.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Authorized actor or system process
    authorized_by_actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_system_generated = Column(Boolean, default=True, nullable=False)
    
    # Counterparty for pair-wise interaction validation
    counterparty_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Audit and reasoning payload
    metadata_payload = Column(JSON, default=dict, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="kin_ledger_entries")
    counterparty = relationship("User", foreign_keys=[counterparty_user_id])
    authorizer = relationship("User", foreign_keys=[authorized_by_actor_id])
    reversal_of = relationship("KinLedgerEntry", remote_side=[id], foreign_keys=[reversal_of_entry_id])


class KinAbuseAuditLog(Base):
    """
    Audit log for abuse tracking, anomalous velocity, ring trading, and spam detection.
    """
    __tablename__ = "kin_abuse_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    counterparty_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(String(60), index=True, nullable=False)
    flag_reason = Column(String(150), nullable=False)
    severity = Column(String(30), default=AbuseFlagSeverity.WARNING.value, nullable=False)
    details = Column(JSON, default=dict, nullable=False)
    resolved = Column(Boolean, default=False, nullable=False)
    resolution_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    counterparty = relationship("User", foreign_keys=[counterparty_user_id])

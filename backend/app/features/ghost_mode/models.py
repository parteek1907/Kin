"""
Database models and enums for Kin Ghost Mode.
Separates authenticated account identity from pseudonymous public personas,
content records, and strictly audited moderation lookups.
"""

import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint, JSON
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


class EntitlementStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    REVOKED = "revoked"


class EntitlementPlan(str, enum.Enum):
    GHOST_MONTHLY = "ghost_monthly"
    GHOST_ANNUAL = "ghost_annual"
    PASS_30_DAYS = "pass_30_days"
    FACULTY_COMPLIMENTARY = "faculty_complimentary"


class GhostPostCategory(str, enum.Enum):
    SALARY_NEGOTIATION = "salary_negotiation"
    WORKPLACE_CHALLENGES = "workplace_challenges"
    CAREER_PIVOT = "career_pivot"
    REJECTION_AND_LAYOFFS = "rejection_and_layoffs"
    ETHICAL_DILEMMA = "ethical_dilemma"
    SENSITIVE_ADVICE = "sensitive_advice"
    GENERAL_ANONYMOUS = "general_anonymous"


class ContentStatus(str, enum.Enum):
    PUBLISHED = "published"
    FLAGGED = "flagged"
    HIDDEN = "hidden"
    DELETED = "deleted"


class ReportReason(str, enum.Enum):
    HARASSMENT = "harassment"
    DOXXING = "doxxing"
    THREAT = "threat"
    SPAM = "spam"
    HATE_SPEECH = "hate_speech"
    MISINFORMATION = "misinformation"
    OTHER = "other"


class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    DISMISSED = "dismissed"
    ACTION_TAKEN = "action_taken"


class ReactionType(str, enum.Enum):
    HELPFUL = "helpful"
    INSIGHTFUL = "insightful"
    SUPPORTIVE = "supportive"
    RELATABLE = "relatable"


class GhostEntitlement(Base):
    """
    Tracks a member's premium subscription or pass for Ghost Mode.
    Verified strictly server-side.
    """
    __tablename__ = "ghost_entitlements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    plan_type = Column(String(50), default=EntitlementPlan.GHOST_MONTHLY.value, nullable=False)
    status = Column(String(30), default=EntitlementStatus.ACTIVE.value, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    auto_renew = Column(Boolean, default=True, nullable=False)
    payment_reference = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="ghost_entitlement")

    def is_active_entitlement(self) -> bool:
        """Determines if the entitlement currently permits posting new ghost content."""
        if self.status != EntitlementStatus.ACTIVE.value:
            return False
        exp = to_utc(self.expires_at)
        return exp > datetime.now(timezone.utc)


class GhostPersona(Base):
    """
    Pseudonymous public persona.
    Contains opaque handles and random display aliases.
    Does NOT link back to User in public queries.
    """
    __tablename__ = "ghost_personas"

    id = Column(Integer, primary_key=True, index=True)
    persona_handle = Column(String(64), unique=True, index=True, nullable=False)
    pseudonym = Column(String(100), nullable=False)
    avatar_seed = Column(String(50), nullable=False)
    theme_color = Column(String(30), default="indigo", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class GhostIdentityMapping(Base):
    """
    Strictly isolated mapping between authenticated User and Ghost Persona.
    Never exposed through public endpoints or nested serializers.
    """
    __tablename__ = "ghost_identity_mappings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    persona_id = Column(Integer, ForeignKey("ghost_personas.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    is_current = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User")
    persona = relationship("GhostPersona")


class GhostPost(Base):
    """
    Community discussion published under pseudonymous Ghost Persona.
    """
    __tablename__ = "ghost_posts"

    id = Column(Integer, primary_key=True, index=True)
    persona_id = Column(Integer, ForeignKey("ghost_personas.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), default=GhostPostCategory.GENERAL_ANONYMOUS.value, index=True, nullable=False)
    status = Column(String(30), default=ContentStatus.PUBLISHED.value, index=True, nullable=False)

    view_count = Column(Integer, default=0, nullable=False)
    reply_count = Column(Integer, default=0, nullable=False)
    reaction_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    persona = relationship("GhostPersona")
    replies = relationship("GhostReply", back_populates="post", cascade="all, delete-orphan")


class GhostReply(Base):
    """
    Threaded reply to a ghost post.
    """
    __tablename__ = "ghost_replies"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("ghost_posts.id", ondelete="CASCADE"), index=True, nullable=False)
    persona_id = Column(Integer, ForeignKey("ghost_personas.id", ondelete="CASCADE"), index=True, nullable=False)
    parent_reply_id = Column(Integer, ForeignKey("ghost_replies.id", ondelete="CASCADE"), nullable=True)
    content = Column(Text, nullable=False)
    status = Column(String(30), default=ContentStatus.PUBLISHED.value, nullable=False)
    reaction_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    post = relationship("GhostPost", back_populates="replies")
    persona = relationship("GhostPersona")


class GhostReaction(Base):
    """
    Emoji or sentiment reaction to a ghost post or reply.
    """
    __tablename__ = "ghost_reactions"

    id = Column(Integer, primary_key=True, index=True)
    target_type = Column(String(20), index=True, nullable=False)  # "post" or "reply"
    target_id = Column(Integer, index=True, nullable=False)
    persona_id = Column(Integer, ForeignKey("ghost_personas.id", ondelete="CASCADE"), index=True, nullable=False)
    reaction_type = Column(String(30), default=ReactionType.HELPFUL.value, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    persona = relationship("GhostPersona")

    __table_args__ = (
        UniqueConstraint("target_type", "target_id", "persona_id", "reaction_type", name="uq_ghost_reaction_target_persona"),
    )


class GhostReport(Base):
    """
    Abuse and safety report against a ghost post or reply.
    """
    __tablename__ = "ghost_reports"

    id = Column(Integer, primary_key=True, index=True)
    target_type = Column(String(20), nullable=False)  # "post" or "reply"
    target_id = Column(Integer, nullable=False)
    reporter_persona_id = Column(Integer, ForeignKey("ghost_personas.id", ondelete="SET NULL"), nullable=True)
    reason_category = Column(String(50), nullable=False)
    explanation = Column(Text, nullable=False)
    status = Column(String(30), default=ReportStatus.PENDING.value, index=True, nullable=False)
    moderator_notes = Column(Text, nullable=True)
    reviewed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    reporter_persona = relationship("GhostPersona")
    reviewer = relationship("User")


class GhostPersonaMute(Base):
    """
    Allows a user's ghost persona to mute another persona locally.
    """
    __tablename__ = "ghost_persona_mutes"

    id = Column(Integer, primary_key=True, index=True)
    muter_persona_id = Column(Integer, ForeignKey("ghost_personas.id", ondelete="CASCADE"), index=True, nullable=False)
    muted_persona_id = Column(Integer, ForeignKey("ghost_personas.id", ondelete="CASCADE"), index=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("muter_persona_id", "muted_persona_id", name="uq_ghost_persona_mute_pair"),
    )


class GhostAuditLog(Base):
    """
    Mandatory audit log for any privileged identity inspection by moderators.
    Every reveal operation requires a documented legal/safety reason.
    """
    __tablename__ = "ghost_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    moderator_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    target_persona_id = Column(Integer, ForeignKey("ghost_personas.id", ondelete="CASCADE"), index=True, nullable=False)
    resolved_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    audit_reason = Column(Text, nullable=False)
    action_type = Column(String(50), default="identity_reveal_investigation", nullable=False)
    incident_ticket = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    moderator = relationship("User", foreign_keys=[moderator_user_id])
    target_persona = relationship("GhostPersona", foreign_keys=[target_persona_id])
    resolved_user = relationship("User", foreign_keys=[resolved_user_id])

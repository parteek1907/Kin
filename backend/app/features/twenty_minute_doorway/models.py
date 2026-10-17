import enum
from datetime import datetime, timezone
import hashlib
from typing import Optional
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ExpertVerificationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    SUSPENDED = "suspended"
    REVOKED = "revoked"


class DoorwayCategory(str, enum.Enum):
    CAREER_DECISION = "career_decision"
    PORTFOLIO_CV_REVIEW = "portfolio_cv_review"
    INDUSTRY_GUIDANCE = "industry_guidance"
    STARTUP_FEEDBACK = "startup_feedback"
    TECHNICAL_PROJECT_REVIEW = "technical_project_review"
    INTERVIEW_PREP = "interview_prep"
    DOMAIN_EXPERTISE = "domain_expertise"


class BookingStatus(str, enum.Enum):
    CREATED = "created"
    PAYMENT_PENDING = "payment_pending"
    PAID = "paid"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SETTLEMENT_PENDING = "settlement_pending"
    SETTLED = "settled"

    # Alternative states
    PAYMENT_FAILED = "payment_failed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    REFUND_PENDING = "refund_pending"
    PARTIALLY_REFUNDED = "partially_refunded"
    REFUNDED = "refunded"
    DISPUTED = "disputed"
    PAYOUT_FAILED = "payout_failed"


class PaymentOrderStatus(str, enum.Enum):
    PENDING = "pending"
    REQUIRES_ACTION = "requires_action"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class LedgerEntryType(str, enum.Enum):
    INITIAL_ALLOCATION = "initial_allocation"
    REFUND_ADJUSTMENT = "refund_adjustment"
    DISPUTE_HOLD = "dispute_hold"
    SETTLEMENT_PAYOUT = "settlement_payout"
    RECONCILIATION_CORRECTION = "reconciliation_correction"


class SettlementStatus(str, enum.Enum):
    UNSETTLED = "unsettled"
    PENDING = "pending"
    SETTLED = "settled"
    BLOCKED_DISPUTE = "blocked_dispute"
    BLOCKED_REFUND = "blocked_refund"


class PayoutStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DisputeReason(str, enum.Enum):
    NO_SHOW = "no_show"
    QUALITY_OR_AI_SLOP = "quality_or_ai_slop"
    SCOPE_MISMATCH = "scope_mismatch"
    INCOMPLETE_SESSION = "incomplete_session"
    TECHNICAL_FAILURE = "technical_failure"
    OTHER = "other"


class DisputeStatus(str, enum.Enum):
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    RESOLVED_REFUNDED = "resolved_refunded"
    RESOLVED_PARTIAL_REFUND = "resolved_partial_refund"
    RESOLVED_REJECTED = "resolved_rejected"


class DoorwayExpertProfile(Base):
    """
    Profile for an alumnus verified to offer paid 20-minute consultation doorway sessions.
    Requires human-reviewed institutional affiliation and credential vetting.
    """
    __tablename__ = "doorway_expert_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    institution_affiliation = Column(String(150), nullable=False)
    headline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    current_organization = Column(String(150), nullable=True)
    current_role = Column(String(150), nullable=True)
    years_of_experience = Column(Float, default=0.0, nullable=False)

    expertise_categories = Column(JSON, default=list, nullable=False)  # List of DoorwayCategory strings
    supported_consultation_types = Column(JSON, default=list, nullable=False)
    evidence_links = Column(JSON, default=list, nullable=False)
    verification_notes = Column(Text, nullable=True)  # Admin-only notes

    verification_status = Column(String(30), default=ExpertVerificationStatus.PENDING.value, nullable=False, index=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reverification_due_at = Column(DateTime(timezone=True), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False, index=True)
    availability_slots = Column(JSON, default=list, nullable=False)

    # Reliability and Quality Metrics
    completed_sessions_count = Column(Integer, default=0, nullable=False)
    total_reviews_count = Column(Integer, default=0, nullable=False)
    average_rating = Column(Float, default=0.0, nullable=False)
    response_rate_percent = Column(Float, default=100.0, nullable=False)
    ai_slop_complaints_count = Column(Integer, default=0, nullable=False)

    # Bank / Payout Account (masked, e.g. {"account_mask": "acct_****1234", "payout_method": "bank_transfer"})
    payout_account_details = Column(JSON, default=dict, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    verified_by = relationship("User", foreign_keys=[verified_by_user_id])
    listings = relationship("DoorwayListing", back_populates="expert_profile", cascade="all, delete-orphan")


class DoorwayListing(Base):
    """
    Service consultation listing created by an approved expert.
    """
    __tablename__ = "doorway_listings"

    id = Column(Integer, primary_key=True, index=True)
    expert_profile_id = Column(Integer, ForeignKey("doorway_expert_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    expert_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(200), nullable=False)
    service_scope = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    expected_deliverables = Column(JSON, default=list, nullable=False)
    session_duration_minutes = Column(Integer, default=20, nullable=False)

    # Price in integer minor-units (e.g. 5000 = Rs 50.00 or $50.00). Never floating point!
    price_amount_minor = Column(Integer, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)

    pricing_policy_version = Column(String(20), default="v1_split_50_50", nullable=False)
    availability_slots = Column(JSON, default=list, nullable=False)
    booking_constraints = Column(JSON, default=dict, nullable=False)
    cancellation_policy = Column(Text, nullable=True)
    preparation_requirements = Column(Text, nullable=True)
    service_limitations = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    expert_profile = relationship("DoorwayExpertProfile", back_populates="listings")
    expert_user = relationship("User", foreign_keys=[expert_user_id])
    bookings = relationship("DoorwayBooking", back_populates="listing", cascade="all, delete-orphan")


class DoorwayBooking(Base):
    """
    Persistent consultation booking lifecycle state machine.
    """
    __tablename__ = "doorway_bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(50), unique=True, nullable=False, index=True)

    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    expert_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("doorway_listings.id", ondelete="CASCADE"), nullable=False, index=True)

    status = Column(String(30), default=BookingStatus.CREATED.value, nullable=False, index=True)

    scheduled_start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    scheduled_end_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=20, nullable=False)

    student_notes = Column(Text, nullable=True)
    preparation_submitted = Column(JSON, default=dict, nullable=False)

    # AI assistance disclosure: expert must declare if any AI tool was used for prep
    ai_assistance_used = Column(Boolean, default=False, nullable=False)
    ai_assistance_summary = Column(Text, nullable=True)

    # Consent and privacy: recording is false by default
    recording_consent = Column(Boolean, default=False, nullable=False)
    recording_url = Column(String(255), nullable=True)

    # Trusted financial snapshot at time of booking
    gross_amount_minor = Column(Integer, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    pricing_policy_version = Column(String(20), default="v1_split_50_50", nullable=False)

    # Completion evidence
    student_completed = Column(Boolean, default=False, nullable=False)
    student_completed_at = Column(DateTime(timezone=True), nullable=True)
    expert_completed = Column(Boolean, default=False, nullable=False)
    expert_completed_at = Column(DateTime(timezone=True), nullable=True)

    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Cancellation & No-show
    no_show_reported_by = Column(String(30), nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    cancelled_by_user_id = Column(Integer, nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    expert_user = relationship("User", foreign_keys=[expert_user_id])
    listing = relationship("DoorwayListing", back_populates="bookings")
    payment_order = relationship("DoorwayPaymentOrder", uselist=False, back_populates="booking", cascade="all, delete-orphan")
    ledger_entries = relationship("DoorwayFinancialLedgerEntry", back_populates="booking", cascade="all, delete-orphan")
    payout = relationship("DoorwayAlumniPayout", uselist=False, back_populates="booking", cascade="all, delete-orphan")
    review = relationship("DoorwayReview", uselist=False, back_populates="booking", cascade="all, delete-orphan")
    disputes = relationship("DoorwayDispute", back_populates="booking", cascade="all, delete-orphan")


class DoorwayPaymentOrder(Base):
    """
    Payment order intent integrating with the payment gateway abstraction.
    """
    __tablename__ = "doorway_payment_orders"

    id = Column(Integer, primary_key=True, index=True)
    payment_intent_reference = Column(String(64), unique=True, nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("doorway_bookings.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    provider_name = Column(String(50), default="mock_gateway", nullable=False)
    provider_order_id = Column(String(100), nullable=False, index=True)
    provider_payment_id = Column(String(100), nullable=True, index=True)

    amount_minor = Column(Integer, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)

    status = Column(String(30), default=PaymentOrderStatus.PENDING.value, nullable=False, index=True)
    client_secret = Column(String(128), nullable=False)
    idempotency_key = Column(String(100), unique=True, nullable=False, index=True)

    webhook_last_event_id = Column(String(100), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    booking = relationship("DoorwayBooking", back_populates="payment_order")


class DoorwayFinancialLedgerEntry(Base):
    """
    Durable, immutable financial ledger record for paid bookings.
    Calculates exact 50% platform / 50% alumni split in integer minor units.
    """
    __tablename__ = "doorway_financial_ledger"

    id = Column(Integer, primary_key=True, index=True)
    entry_reference = Column(String(64), unique=True, nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("doorway_bookings.id", ondelete="CASCADE"), nullable=False, index=True)

    gross_amount_minor = Column(Integer, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)

    # Commission Base and 50/50 split
    eligible_commission_base_minor = Column(Integer, nullable=False)
    platform_share_minor = Column(Integer, nullable=False)
    alumni_share_minor = Column(Integer, nullable=False)

    taxes_minor = Column(Integer, default=0, nullable=False)
    processing_fees_minor = Column(Integer, default=0, nullable=False)
    refund_amount_minor = Column(Integer, default=0, nullable=False)
    adjustment_amount_minor = Column(Integer, default=0, nullable=False)

    entry_type = Column(String(40), default=LedgerEntryType.INITIAL_ALLOCATION.value, nullable=False, index=True)
    pricing_policy_version = Column(String(20), default="v1_split_50_50", nullable=False)

    settlement_status = Column(String(30), default=SettlementStatus.UNSETTLED.value, nullable=False, index=True)
    payout_reference = Column(String(64), nullable=True, index=True)
    reconciliation_status = Column(String(30), default="matched", nullable=False)

    # Linked reversal/adjustment: previous entries are NEVER mutated or erased!
    reversal_of_entry_id = Column(Integer, ForeignKey("doorway_financial_ledger.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)

    # Immutable audit hash: SHA-256 computed on entry creation
    immutable_audit_hash = Column(String(64), nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    booking = relationship("DoorwayBooking", back_populates="ledger_entries")

    @staticmethod
    def compute_audit_hash(
        entry_reference: str,
        booking_id: int,
        gross_minor: int,
        alumni_minor: int,
        platform_minor: int,
        entry_type: str,
        created_at: datetime
    ) -> str:
        payload = f"{entry_reference}:{booking_id}:{gross_minor}:{alumni_minor}:{platform_minor}:{entry_type}:{created_at.isoformat()}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()


class DoorwayAlumniPayout(Base):
    """
    Authorized settlement disbursement / payout to the verified alumnus.
    Enforces unique constraint on booking_id: prevents duplicate payouts!
    """
    __tablename__ = "doorway_alumni_payouts"

    id = Column(Integer, primary_key=True, index=True)
    payout_reference = Column(String(64), unique=True, nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("doorway_bookings.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    expert_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    amount_minor = Column(Integer, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)

    payout_status = Column(String(30), default=PayoutStatus.SCHEDULED.value, nullable=False, index=True)
    provider_transfer_id = Column(String(100), nullable=True)
    destination_account_mask = Column(String(50), nullable=False)

    failure_reason = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    idempotency_key = Column(String(100), unique=True, nullable=False, index=True)

    authorized_by_admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    executed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    booking = relationship("DoorwayBooking", back_populates="payout")
    expert_user = relationship("User", foreign_keys=[expert_user_id])
    authorized_by = relationship("User", foreign_keys=[authorized_by_admin_id])


class DoorwayReview(Base):
    """
    Post-session structured student feedback and evaluation.
    Includes explicit AI slop reporting and human value verification.
    """
    __tablename__ = "doorway_reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("doorway_bookings.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    expert_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    rating = Column(Integer, nullable=False)  # 1 to 5
    review_text = Column(Text, nullable=False)
    usefulness_score = Column(Integer, default=5, nullable=False)  # 1 to 5

    # Human expertise verification and anti-slop check
    human_expertise_verified = Column(Boolean, default=True, nullable=False)
    ai_slop_complaint = Column(Boolean, default=False, nullable=False)
    would_recommend = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    booking = relationship("DoorwayBooking", back_populates="review")
    student = relationship("User", foreign_keys=[student_id])
    expert_user = relationship("User", foreign_keys=[expert_user_id])


class DoorwayDispute(Base):
    """
    Formal dispute raised by student or expert. Immediately halts settlement.
    """
    __tablename__ = "doorway_disputes"

    id = Column(Integer, primary_key=True, index=True)
    dispute_reference = Column(String(64), unique=True, nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("doorway_bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    opened_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    dispute_reason = Column(String(50), nullable=False, index=True)  # DisputeReason value
    detailed_explanation = Column(Text, nullable=False)
    requested_resolution = Column(String(50), default="full_refund", nullable=False)

    status = Column(String(30), default=DisputeStatus.OPEN.value, nullable=False, index=True)
    resolution_notes = Column(Text, nullable=True)
    refund_amount_minor = Column(Integer, default=0, nullable=False)

    resolved_by_admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    booking = relationship("DoorwayBooking", back_populates="disputes")
    opened_by = relationship("User", foreign_keys=[opened_by_user_id])
    resolved_by = relationship("User", foreign_keys=[resolved_by_admin_id])


class DoorwayAuditLog(Base):
    """
    Immutable audit history log for doorway lifecycle, payment, and payout operations.
    """
    __tablename__ = "doorway_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(String(100), nullable=False, index=True)
    action = Column(String(50), nullable=False, index=True)

    actor_user_id = Column(Integer, nullable=True, index=True)
    actor_role = Column(String(50), nullable=True)

    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    metadata_payload = Column(JSON, default=dict, nullable=False)

    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

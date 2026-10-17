from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.features.twenty_minute_doorway.models import (
    ExpertVerificationStatus,
    DoorwayCategory,
    BookingStatus,
    PaymentOrderStatus,
    LedgerEntryType,
    SettlementStatus,
    PayoutStatus,
    DisputeReason,
    DisputeStatus,
)


# ==========================================
# Expert Profile Schemas
# ==========================================

class ExpertApplyRequest(BaseModel):
    institution_affiliation: str = Field(..., min_length=2, max_length=150)
    headline: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=3000)
    current_organization: Optional[str] = Field(None, max_length=150)
    current_role: Optional[str] = Field(None, max_length=150)
    years_of_experience: float = Field(0.0, ge=0.0, le=70.0)
    expertise_categories: List[DoorwayCategory] = Field(..., min_length=1)
    supported_consultation_types: List[str] = Field(default_factory=list)
    evidence_links: List[str] = Field(..., min_length=1, description="Portfolio, LinkedIn, GitHub, or institutional credential evidence")
    availability_slots: List[Dict[str, Any]] = Field(default_factory=list)
    payout_account_details: Dict[str, Any] = Field(
        default_factory=dict,
        description="Bank account or UPI details (masked in responses)"
    )


class ExpertProfileUpdate(BaseModel):
    headline: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=3000)
    current_organization: Optional[str] = Field(None, max_length=150)
    current_role: Optional[str] = Field(None, max_length=150)
    years_of_experience: Optional[float] = Field(None, ge=0.0, le=70.0)
    expertise_categories: Optional[List[DoorwayCategory]] = None
    supported_consultation_types: Optional[List[str]] = None
    availability_slots: Optional[List[Dict[str, Any]]] = None
    payout_account_details: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class ExpertVerificationAdminRequest(BaseModel):
    verification_status: ExpertVerificationStatus
    verification_notes: Optional[str] = None
    reverification_due_days: Optional[int] = Field(365, ge=30, le=730)


class ExpertPublicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    institution_affiliation: str
    headline: Optional[str] = None
    bio: Optional[str] = None
    current_organization: Optional[str] = None
    current_role: Optional[str] = None
    years_of_experience: float
    expertise_categories: List[str]
    supported_consultation_types: List[str]
    verification_status: str
    verified_at: Optional[datetime] = None
    is_active: bool
    completed_sessions_count: int
    total_reviews_count: int
    average_rating: float
    response_rate_percent: float
    availability_slots: List[Dict[str, Any]]


class ExpertPrivateResponse(ExpertPublicResponse):
    """Includes credential evidence and verification notes for the expert or administrator."""
    evidence_links: List[str]
    verification_notes: Optional[str] = None
    reverification_due_at: Optional[datetime] = None
    payout_account_mask: Optional[str] = None


# ==========================================
# Consultation Listing Schemas
# ==========================================

class ListingCreateRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    service_scope: str = Field(..., min_length=20, max_length=4000)
    category: DoorwayCategory
    expected_deliverables: List[str] = Field(..., min_length=1)
    session_duration_minutes: int = Field(20, ge=15, le=60)
    price_amount_minor: int = Field(..., ge=100, description="Price in integer minor currency units (e.g., 5000 = 50.00)")
    currency: str = Field("INR", min_length=3, max_length=3)
    availability_slots: List[Dict[str, Any]] = Field(default_factory=list)
    booking_constraints: Dict[str, Any] = Field(default_factory=dict)
    cancellation_policy: Optional[str] = Field(None, max_length=1000)
    preparation_requirements: Optional[str] = Field(None, max_length=1000)
    service_limitations: Optional[str] = Field(None, max_length=1000)


class ListingUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    service_scope: Optional[str] = Field(None, min_length=20, max_length=4000)
    category: Optional[DoorwayCategory] = None
    expected_deliverables: Optional[List[str]] = None
    price_amount_minor: Optional[int] = Field(None, ge=100)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    availability_slots: Optional[List[Dict[str, Any]]] = None
    booking_constraints: Optional[Dict[str, Any]] = None
    cancellation_policy: Optional[str] = None
    preparation_requirements: Optional[str] = None
    service_limitations: Optional[str] = None
    is_active: Optional[bool] = None


class ListingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    expert_profile_id: int
    expert_user_id: int
    title: str
    service_scope: str
    category: str
    expected_deliverables: List[str]
    session_duration_minutes: int
    price_amount_minor: int
    currency: str
    pricing_policy_version: str
    availability_slots: List[Dict[str, Any]]
    booking_constraints: Dict[str, Any]
    cancellation_policy: Optional[str] = None
    preparation_requirements: Optional[str] = None
    service_limitations: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ==========================================
# Booking & Session Schemas
# ==========================================

class BookingCreateRequest(BaseModel):
    listing_id: int
    scheduled_start_time: datetime
    student_notes: Optional[str] = Field(None, max_length=2000)
    preparation_submitted: Dict[str, Any] = Field(default_factory=dict)
    recording_consent: bool = False


class BookingRescheduleRequest(BaseModel):
    new_scheduled_start_time: datetime
    reschedule_reason: Optional[str] = Field(None, max_length=500)


class BookingCancellationRequest(BaseModel):
    cancellation_reason: str = Field(..., min_length=5, max_length=1000)


class BookingCompleteRequest(BaseModel):
    notes: Optional[str] = Field(None, max_length=1000)
    ai_assistance_used: bool = False
    ai_assistance_summary: Optional[str] = Field(None, max_length=1000)


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_reference: str
    student_id: int
    expert_user_id: int
    listing_id: int
    status: str
    scheduled_start_time: datetime
    scheduled_end_time: datetime
    duration_minutes: int
    student_notes: Optional[str] = None
    ai_assistance_used: bool
    ai_assistance_summary: Optional[str] = None
    recording_consent: bool
    gross_amount_minor: int
    currency: str
    pricing_policy_version: str
    student_completed: bool
    expert_completed: bool
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    no_show_reported_by: Optional[str] = None
    cancellation_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


# ==========================================
# Payment & Webhook Schemas
# ==========================================

class PaymentIntentResponse(BaseModel):
    payment_intent_reference: str
    booking_reference: str
    provider_name: str
    provider_order_id: str
    amount_minor: int
    currency: str
    client_secret: str
    status: str


class PaymentVerifyRequest(BaseModel):
    provider_order_id: str
    provider_payment_id: str
    signature: Optional[str] = None


class PaymentWebhookPayload(BaseModel):
    event_id: str
    event_type: str
    provider_order_id: str
    provider_payment_id: Optional[str] = None
    amount_minor: int
    currency: str
    status: str
    created_at_timestamp: int


# ==========================================
# Financial Ledger & Payout Schemas
# ==========================================

class FinancialCalculationResult(BaseModel):
    gross_amount_minor: int
    currency: str
    eligible_commission_base_minor: int
    platform_share_minor: int
    alumni_share_minor: int
    taxes_minor: int
    processing_fees_minor: int
    pricing_policy_version: str
    rounding_mode: str = "integer_floor_alumni_platform_absorbs_odd"


class LedgerEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entry_reference: str
    booking_id: int
    gross_amount_minor: int
    currency: str
    eligible_commission_base_minor: int
    platform_share_minor: int
    alumni_share_minor: int
    taxes_minor: int
    processing_fees_minor: int
    refund_amount_minor: int
    adjustment_amount_minor: int
    entry_type: str
    pricing_policy_version: str
    settlement_status: str
    payout_reference: Optional[str] = None
    reconciliation_status: str
    reversal_of_entry_id: Optional[int] = None
    notes: Optional[str] = None
    immutable_audit_hash: str
    created_at: datetime


class AlumniEarningsSummary(BaseModel):
    expert_user_id: int
    currency: str
    total_lifetime_gross_minor: int
    total_alumni_earned_minor: int
    total_settled_payouts_minor: int
    pending_settlement_minor: int
    blocked_dispute_minor: int
    completed_sessions_count: int
    ledger_entries: List[LedgerEntryResponse]


class PayoutDisbursementRequest(BaseModel):
    notes: Optional[str] = Field(None, max_length=500)


class PayoutResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    payout_reference: str
    booking_id: int
    expert_user_id: int
    amount_minor: int
    currency: str
    payout_status: str
    provider_transfer_id: Optional[str] = None
    destination_account_mask: str
    failure_reason: Optional[str] = None
    retry_count: int
    idempotency_key: str
    executed_at: Optional[datetime] = None
    created_at: datetime


# ==========================================
# Review & Dispute Schemas
# ==========================================

class ReviewCreateRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review_text: str = Field(..., min_length=10, max_length=2000)
    usefulness_score: int = Field(..., ge=1, le=5)
    human_expertise_verified: bool = True
    ai_slop_complaint: bool = False
    would_recommend: bool = True


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    student_id: int
    expert_user_id: int
    rating: int
    review_text: str
    usefulness_score: int
    human_expertise_verified: bool
    ai_slop_complaint: bool
    would_recommend: bool
    created_at: datetime


class DisputeCreateRequest(BaseModel):
    dispute_reason: DisputeReason
    detailed_explanation: str = Field(..., min_length=20, max_length=3000)
    requested_resolution: str = Field("full_refund", pattern="^(full_refund|partial_refund|reschedule|dismiss)$")


class DisputeResolutionRequest(BaseModel):
    status: DisputeStatus
    resolution_notes: str = Field(..., min_length=10, max_length=2000)
    refund_amount_minor: Optional[int] = Field(0, ge=0)


class DisputeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dispute_reference: str
    booking_id: int
    opened_by_user_id: int
    dispute_reason: str
    detailed_explanation: str
    requested_resolution: str
    status: str
    resolution_notes: Optional[str] = None
    refund_amount_minor: int
    resolved_by_admin_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

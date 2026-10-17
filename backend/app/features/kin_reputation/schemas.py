"""
Pydantic v2 schemas for Kin Reputation Engine.
Includes robust validation, serialization, and strict security isolation
preventing leakage of internal anti-abuse or fraud signals.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.features.kin_reputation.models import ContributionEventType, VerificationStatus, ReputationTier


class PointsPolicyBase(BaseModel):
    event_type: str = Field(..., description="Unique slug for the contribution event category")
    display_name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    base_points: int = Field(..., gt=0, le=500, description="Points awarded for verified contribution")
    daily_cap: int = Field(100, ge=10, le=1000, description="Max points per member per day for this category")
    cooldown_seconds: int = Field(300, ge=0, le=86400, description="Minimum cooldown between events")
    requires_counterparty: bool = Field(False, description="Whether this event requires a distinct counterparty user")
    requires_verification: bool = Field(True, description="Whether explicit verification is required before awarding")
    min_quality_score: float = Field(0.0, ge=0.0, le=10.0, description="Minimum quality score required")
    policy_version: str = Field("v1.0", max_length=20)
    is_active: bool = True

    @field_validator("event_type", mode="before")
    @classmethod
    def clean_event_type(cls, v: Any) -> str:
        if isinstance(v, str):
            return v.strip().lower().replace("-", "_")
        return str(v)


class PointsPolicyCreate(PointsPolicyBase):
    pass


class PointsPolicyUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    base_points: Optional[int] = Field(None, gt=0, le=500)
    daily_cap: Optional[int] = Field(None, ge=10, le=1000)
    cooldown_seconds: Optional[int] = Field(None, ge=0, le=86400)
    requires_counterparty: Optional[bool] = None
    requires_verification: Optional[bool] = None
    min_quality_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    is_active: Optional[bool] = None


class PointsPolicyResponse(PointsPolicyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReputationSummaryResponse(BaseModel):
    user_id: int
    lifetime_points: int
    total_adjustments: int
    current_points: int
    rolling_30d_points: int
    rolling_90d_points: int
    tier: str
    verified_contributions_count: int
    category_breakdown: Dict[str, int]
    last_activity_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PublicReputationResponse(BaseModel):
    """
    Sanitized public representation for member profiles.
    Zero leakage of internal moderation, fraud signals, or ledger dispute records.
    """
    user_id: int
    full_name: str
    headline: Optional[str] = None
    role: str
    tier: str
    current_points: int
    verified_contributions_count: int
    top_contribution_category: Optional[str] = None


class LedgerEntryResponse(BaseModel):
    id: int
    user_id: int
    event_type: str
    source_reference: str
    idempotency_key: str
    points: int
    policy_version: str
    verification_status: str
    reversal_of_entry_id: Optional[int] = None
    is_system_generated: bool
    counterparty_user_id: Optional[int] = None
    reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedLedgerResponse(BaseModel):
    items: List[LedgerEntryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    full_name: str
    role: str
    headline: Optional[str] = None
    tier: str
    score: int
    verified_contributions_count: int
    top_category: Optional[str] = None


class LeaderboardResponse(BaseModel):
    window: str
    total_participants: int
    items: List[LeaderboardEntry]


class CategoryBreakdownItem(BaseModel):
    event_type: str
    display_name: str
    points_earned: int
    event_count: int
    percentage: float


class ContributionBreakdownResponse(BaseModel):
    user_id: int
    current_points: int
    lifetime_points: int
    verified_contributions_count: int
    categories: List[CategoryBreakdownItem]


class RecordVerifiedEventRequest(BaseModel):
    """
    Privileged payload for trusted backend workflows or administrative actions.
    Ordinary users cannot invoke this directly.
    """
    user_id: int = Field(..., gt=0, description="Member receiving reputation points")
    event_type: str = Field(..., description="Eligible event category")
    source_reference: str = Field(..., min_length=3, max_length=255, description="Unique domain identifier e.g. 'mentoring:42'")
    idempotency_key: Optional[str] = Field(None, max_length=255, description="Client/service generated unique idempotency key")
    counterparty_user_id: Optional[int] = Field(None, gt=0, description="Counterparty member involved in interaction")
    quality_score: Optional[float] = Field(None, ge=0.0, le=10.0, description="Quality/rating score of the contribution")
    metadata_payload: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Audit and context payload")
    verification_proof: Optional[str] = Field(None, max_length=500, description="Proof or reference to completion verification")

    @field_validator("event_type", mode="before")
    @classmethod
    def clean_event_type(cls, v: Any) -> str:
        if isinstance(v, str):
            return v.strip().lower().replace("-", "_")
        return str(v)


class ReversalRequest(BaseModel):
    entry_id: int = Field(..., gt=0, description="ID of the ledger entry to reverse")
    reason: str = Field(..., min_length=5, max_length=500, description="Reason for reversal or dispute correction")
    dispute_reference: Optional[str] = Field(None, max_length=255, description="Optional support ticket or dispute ID")


class RecordEventResponse(BaseModel):
    success: bool
    transaction_id: int
    idempotency_key: str
    points_awarded: int
    new_current_points: int
    new_tier: str
    verification_status: str
    message: str

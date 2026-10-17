"""
Pydantic v2 schemas for Kin Ghost Mode.
Guarantees absolute separation between real member profiles and pseudonymous personas.
Zero exposure of user IDs, emails, profile URLs, or internal database keys in public responses.
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.features.ghost_mode.models import (
    EntitlementPlan,
    EntitlementStatus,
    GhostPostCategory,
    ContentStatus,
    ReportReason,
    ReactionType,
)


class EntitlementStatusResponse(BaseModel):
    is_entitled: bool
    can_post: bool
    plan_type: Optional[str] = None
    status: str
    expires_at: Optional[datetime] = None
    auto_renew: bool = False
    message: str


class EntitlementActivateRequest(BaseModel):
    plan_type: str = Field("ghost_monthly", description="Entitlement plan: ghost_monthly, ghost_annual, pass_30_days")
    duration_days: int = Field(30, ge=1, le=365, description="Access duration in days")
    payment_reference: Optional[str] = Field(None, max_length=100)


class GhostPersonaPublic(BaseModel):
    """
    Publicly safe pseudonymous author representation.
    No user ID, no email, no university ID, no real name.
    """
    persona_handle: str
    pseudonym: str
    avatar_seed: str
    theme_color: str

    model_config = ConfigDict(from_attributes=True)


class GhostPersonaResponse(GhostPersonaPublic):
    id: int
    is_active: bool
    created_at: datetime


class GhostPostCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200, description="Title of the pseudonymous discussion")
    content: str = Field(..., min_length=15, max_length=10000, description="Detailed problem, question, or experience")
    category: str = Field("general_anonymous", description="Topic category slug")

    @field_validator("category", mode="before")
    @classmethod
    def clean_category(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower().replace("-", "_")
        return str(v)


class GhostPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    content: Optional[str] = Field(None, min_length=15, max_length=10000)
    category: Optional[str] = None


class GhostReplyCreate(BaseModel):
    content: str = Field(..., min_length=3, max_length=5000, description="Reply text under pseudonym")
    parent_reply_id: Optional[int] = Field(None, description="Optional parent reply ID for threaded conversations")


class GhostReplyResponse(BaseModel):
    id: int
    post_id: int
    author: GhostPersonaPublic
    parent_reply_id: Optional[int] = None
    content: str
    status: str
    reaction_count: int
    created_at: datetime
    is_own: bool = False

    model_config = ConfigDict(from_attributes=True)


class GhostPostResponse(BaseModel):
    id: int
    author: GhostPersonaPublic
    title: str
    content: str
    category: str
    status: str
    view_count: int
    reply_count: int
    reaction_count: int
    created_at: datetime
    updated_at: datetime
    is_own: bool = False
    replies: Optional[List[GhostReplyResponse]] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedGhostPostsResponse(BaseModel):
    items: List[GhostPostResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ReactionRequest(BaseModel):
    target_type: str = Field(..., pattern="^(post|reply)$")
    target_id: int = Field(..., gt=0)
    reaction_type: str = Field("helpful", description="Reaction sentiment: helpful, insightful, supportive, relatable")


class ReportCreateRequest(BaseModel):
    target_type: str = Field(..., pattern="^(post|reply)$")
    target_id: int = Field(..., gt=0)
    reason_category: str = Field(..., description="harassment, doxxing, threat, spam, hate_speech, misinformation, other")
    explanation: str = Field(..., min_length=10, max_length=1000, description="Details explaining the community guideline violation")


class ReportResponse(BaseModel):
    id: int
    target_type: str
    target_id: int
    reason_category: str
    explanation: str
    status: str
    moderator_notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MutePersonaRequest(BaseModel):
    target_persona_handle: str = Field(..., min_length=5, max_length=64)


class ModerationActionRequest(BaseModel):
    target_type: str = Field(..., pattern="^(post|reply)$")
    target_id: int = Field(..., gt=0)
    action: str = Field(..., pattern="^(hide|restore|dismiss_reports)$")
    moderator_notes: Optional[str] = Field(None, max_length=500)


class IdentityRevealRequest(BaseModel):
    persona_handle: str = Field(..., min_length=5, max_length=64)
    audit_reason: str = Field(..., min_length=10, max_length=1000, description="Mandatory documented reason for emergency/legal identity inspection")
    incident_ticket: Optional[str] = Field(None, max_length=100)


class IdentityRevealResponse(BaseModel):
    persona_handle: str
    pseudonym: str
    revealed_user_id: int
    revealed_user_email: str
    revealed_user_name: str
    audit_log_id: int
    warning: str

from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ConnectionPolicyBase(BaseModel):
    policy_name: str = Field(..., min_length=1, max_length=150, description="Name or label for this connection policy")
    required_skills: List[str] = Field(default_factory=list, description="Mandatory skills required for connection")
    preferred_skills: List[str] = Field(default_factory=list, description="Preferred skills that boost matching score")
    relevant_industries: List[str] = Field(default_factory=list, description="Industries or domains of interest")
    min_project_count: int = Field(default=0, ge=0, description="Minimum number of verifiable relevant projects")
    min_years_experience: float = Field(default=0.0, ge=0.0, description="Minimum required years of experience")
    qualification_requirements: List[str] = Field(default_factory=list, description="Education or degree criteria (e.g. B.Tech, M.S.)")
    auto_accept_enabled: bool = Field(default=False, description="Whether qualifying requests are auto-accepted (MUST be explicitly enabled)")
    is_active: bool = Field(default=True, description="Whether this policy is actively evaluated for incoming requests")


class ConnectionPolicyCreate(ConnectionPolicyBase):
    pass


class ConnectionPolicyUpdate(BaseModel):
    policy_name: Optional[str] = Field(None, min_length=1, max_length=150)
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    relevant_industries: Optional[List[str]] = None
    min_project_count: Optional[int] = Field(None, ge=0)
    min_years_experience: Optional[float] = Field(None, ge=0.0)
    qualification_requirements: Optional[List[str]] = None
    auto_accept_enabled: Optional[bool] = None
    is_active: Optional[bool] = None


class ConnectionPolicyResponse(ConnectionPolicyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class EvaluationDetail(BaseModel):
    criterion: str
    satisfied: bool
    detail: str


class EvaluationResult(BaseModel):
    policy_id: Optional[int] = None
    policy_name: Optional[str] = None
    evaluator_user_id: int
    candidate_user_id: int
    eligibility_status: str = Field(..., description="'qualified', 'not_qualified', or 'insufficient_data'")
    auto_accept_eligible: bool = Field(..., description="True only if all mandatory criteria met, policy is active, and recipient enabled auto_accept")
    manual_review_required: bool = Field(..., description="True if automatic acceptance does not occur")
    match_score: float = Field(..., ge=0.0, le=100.0, description="Match score from 0.0 to 100.0")
    criteria_satisfied: List[str] = Field(default_factory=list)
    criteria_not_satisfied: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    explanation: str
    disclaimer: str = "Policy evaluations are empirical matching assessments and do not constitute job offers or referrals."


class EvaluateCandidateRequest(BaseModel):
    policy_id: Optional[int] = Field(None, description="Optional specific policy ID to evaluate against")
    recipient_id: Optional[int] = Field(None, description="Recipient user ID (uses their active policy)")
    candidate_user_id: Optional[int] = Field(None, description="Candidate user ID to evaluate (defaults to current user if omitted)")


class ConnectionRequestCreate(BaseModel):
    recipient_id: int = Field(..., description="User ID of the connection recipient")
    message: Optional[str] = Field(None, max_length=1000, description="Optional note to include with the request")


class ConnectionRequestAction(BaseModel):
    action: str = Field(..., pattern="^(accept|reject)$", description="'accept' or 'reject'")


class ConnectionRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    recipient_id: int
    policy_id: Optional[int] = None
    status: str
    auto_accepted: bool
    message: Optional[str] = None
    evaluation_summary: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    sender_name: Optional[str] = None
    sender_headline: Optional[str] = None
    recipient_name: Optional[str] = None


class ConnectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    connected_user_id: int
    connected_name: str
    connected_headline: Optional[str] = None
    connected_role: Optional[str] = None
    established_at: datetime

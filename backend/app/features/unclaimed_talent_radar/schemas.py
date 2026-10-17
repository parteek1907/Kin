"""
Pydantic Schemas for Unclaimed Talent Radar Feature.
Validates input requests, structures responses, and ensures clean type safety.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import enum
from pydantic import BaseModel, Field, ConfigDict, model_validator

from app.features.unclaimed_talent_radar.models import (
    OpportunityType,
    OpportunityStatus,
    OpportunityVisibility,
    WorkplaceType,
    FeedbackType,
)


class MatchType(str, enum.Enum):
    DIRECT_MATCH = "direct_match"
    ADJACENT_INDUSTRY = "adjacent_industry"
    EXPLORATORY = "exploratory"


class EligibilityStatus(str, enum.Enum):
    ELIGIBLE = "eligible"
    INELIGIBLE = "ineligible"
    UNKNOWN = "unknown"


class SkillEvidenceType(str, enum.Enum):
    SELF_DECLARED = "self_declared"
    PROJECT_EVIDENCED = "project_evidenced"
    VERIFIED_EVIDENCE = "verified_evidence"
    INFERRED = "inferred"


class DiscoveryMode(str, enum.Enum):
    ALL = "all"
    CROSS_INDUSTRY_ONLY = "cross_industry_only"
    DIRECT_ONLY = "direct_only"


# --- Opportunity Schemas ---

class OpportunityBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150, description="Title of the opportunity")
    organization: str = Field(..., min_length=2, max_length=150, description="Company, lab, or organization offering this")
    opportunity_type: OpportunityType = Field(default=OpportunityType.JOB, description="Type of opportunity")
    industry: str = Field(..., min_length=2, max_length=100, description="Primary industry sector")
    description: Optional[str] = Field(None, max_length=10000, description="Detailed opportunity description")

    required_skills: List[str] = Field(default_factory=list, description="Skills strictly required")
    preferred_skills: List[str] = Field(default_factory=list, description="Bonus or preferred skills")

    experience_level: str = Field(default="All", description="e.g. Student, Entry, Mid, Senior, All")
    min_years_experience: float = Field(default=0.0, ge=0.0, description="Minimum years of experience")

    location: Optional[str] = Field(None, max_length=150, description="City, region, or campus")
    workplace_type: WorkplaceType = Field(default=WorkplaceType.REMOTE, description="Remote, onsite, or hybrid")

    eligibility_criteria: Dict[str, Any] = Field(default_factory=dict, description="Structured criteria (degree, min_education, roles)")
    deadline: Optional[datetime] = Field(None, description="Application closing timestamp")

    status: OpportunityStatus = Field(default=OpportunityStatus.OPEN, description="Current opportunity status")
    visibility: OpportunityVisibility = Field(default=OpportunityVisibility.PUBLIC, description="Who can discover this record")
    learning_resources: List[Dict[str, Any]] = Field(default_factory=list, description="Actual stored preparation challenges or docs")


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=150)
    organization: Optional[str] = Field(None, min_length=2, max_length=150)
    opportunity_type: Optional[OpportunityType] = None
    industry: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=10000)
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    experience_level: Optional[str] = None
    min_years_experience: Optional[float] = Field(None, ge=0.0)
    location: Optional[str] = None
    workplace_type: Optional[WorkplaceType] = None
    eligibility_criteria: Optional[Dict[str, Any]] = None
    deadline: Optional[datetime] = None
    status: Optional[OpportunityStatus] = None
    visibility: Optional[OpportunityVisibility] = None
    learning_resources: Optional[List[Dict[str, Any]]] = None


class OpportunityResponse(OpportunityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


# --- User Profile Evidence Analysis Schemas ---

class ProfileSkillItem(BaseModel):
    skill: str
    canonical_name: str
    evidence_type: SkillEvidenceType
    source_evidence: str
    is_verified: bool
    context_role: Optional[str] = None
    context_company: Optional[str] = None


class UserProfileAnalysisResponse(BaseModel):
    user_id: int
    full_name: str
    role: str
    headline: Optional[str] = None
    primary_industry: Optional[str] = None
    years_of_experience: float
    skills: List[ProfileSkillItem]
    declared_skills_count: int
    project_skills_count: int
    verified_skills_count: int
    inferred_skills_count: int
    recorded_projects: List[str]
    education: List[Any]
    disclaimer: str = (
        "Evidence analysis rigorously separates self-declared skills from verified historical achievements. "
        "Inferred skills represent directional transferable potential and are never treated as proven facts."
    )


# --- Transferable Skills & Recommendations Schemas ---

class TransferableSkillDetail(BaseModel):
    user_skill: str
    related_domain: str
    reason: str
    limits: Optional[str] = None
    confidence: Optional[float] = None


class LearningPathSuggestion(BaseModel):
    missing_skill: str
    anchor_skill: Optional[str] = None
    suggested_action: str
    addressed_gap: str
    platform_resources: List[Dict[str, Any]] = Field(default_factory=list)
    disclaimer: str = "Learning suggestions are deterministic preparation guides and do not guarantee hiring or admission."


class RadarRecommendationResponse(BaseModel):
    opportunity_id: int
    title: str
    organization: str
    industry: str
    opportunity_type: str
    location: Optional[str] = None
    workplace_type: str
    deadline: Optional[datetime] = None
    match_type: MatchType
    relevance_score: float = Field(..., ge=0.0, le=100.0, description="Normalized score 0-100")
    matched_skills: List[str]
    transferable_skills: List[TransferableSkillDetail]
    missing_skills: List[str]
    eligibility_status: EligibilityStatus
    eligibility_details: Optional[str] = None
    recommendation_reasons: List[str]
    learning_suggestions: List[LearningPathSuggestion]
    is_user_interested: Optional[bool] = None
    user_feedback: Optional[str] = None
    disclaimer: str = (
        "Relevance score is a deterministic indicator of profile alignment with stored opportunity data, "
        "not a statistical probability of employment."
    )


class RadarDiscoverResponse(BaseModel):
    items: List[RadarRecommendationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    discovery_mode: str


class RadarPersonalizedDashboardResponse(BaseModel):
    user_profile_analysis: UserProfileAnalysisResponse
    total_recommendations: int
    direct_matches: List[RadarRecommendationResponse]
    adjacent_industry_matches: List[RadarRecommendationResponse]
    exploratory_matches: List[RadarRecommendationResponse]
    top_learning_priorities: List[LearningPathSuggestion]


# --- Feedback Schemas ---

class RadarFeedbackCreate(BaseModel):
    opportunity_id: int = Field(..., description="ID of the stored opportunity being evaluated")
    feedback_type: FeedbackType = Field(..., description="User reaction signal")
    notes: Optional[str] = Field(None, max_length=1000, description="Optional user commentary")


class RadarFeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    opportunity_id: int
    feedback_type: FeedbackType
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# --- Skill Map Schemas ---

class SkillMapNode(BaseModel):
    canonical_name: str
    aliases: List[str]
    associated_domains: List[str]
    related_skills: List[str]
    outbound_transferable_count: int


class SkillMapEdge(BaseModel):
    source_skill: str
    target_skill_or_domain: str
    related_domain: str
    confidence: float
    reason: str
    limits: str


class SkillMapResponse(BaseModel):
    queried_skill: Optional[str] = None
    queried_domain: Optional[str] = None
    total_skills: int
    total_relationships: int
    skills: List[SkillMapNode]
    transferable_edges: List[SkillMapEdge]

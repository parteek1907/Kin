"""
Pydantic v2 Schemas for Skill Bounty Network.
Validates challenges, submissions, reviews, outcomes, and recommendation responses.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import re
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator

from app.features.skill_bounty.models import (
    ChallengeCategory,
    ChallengeDifficulty,
    ChallengeStatus,
    SubmissionStatus,
    ReviewStatus,
    OutcomeType,
)

URL_REGEX = re.compile(
    r"^https?://[a-zA-Z0-9\-._~:/?#\[\]@!$&\'()*+,;=%]+$"
)


def validate_web_url(v: Optional[str], field_name: str) -> Optional[str]:
    if not v:
        return None
    val = v.strip()
    if not URL_REGEX.match(val):
        raise ValueError(f"{field_name} must be a valid HTTP or HTTPS URL.")
    return val


# --- Challenge Schemas ---

class ChallengeBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=150, description="Title of the challenge")
    short_summary: str = Field(..., min_length=5, max_length=255, description="Brief summary of what participants will build")
    problem_statement: str = Field(..., min_length=10, description="Detailed problem statement and constraints")
    category: ChallengeCategory = Field(default=ChallengeCategory.BACKEND_ENGINEERING, description="Primary domain category")
    required_skills: List[str] = Field(default_factory=list, description="Skills tested by this challenge")
    difficulty_level: ChallengeDifficulty = Field(default=ChallengeDifficulty.INTERMEDIATE, description="Target difficulty level")
    estimated_effort: Optional[str] = Field(None, max_length=100, description="e.g. '3-5 hours', '1 weekend'")
    submission_instructions: Optional[str] = Field(None, description="Repository and artifact instructions")
    evaluation_criteria: List[Dict[str, Any]] = Field(default_factory=list, description="Rubric criteria with weights")
    deadline: datetime = Field(..., description="Challenge closing timestamp (UTC)")
    organization_name: Optional[str] = Field(None, max_length=150, description="Affiliated company or university lab")
    reward_description: Optional[str] = Field(None, max_length=255, description="Optional reward or recognition (distinct from guaranteed pay)")
    mentorship_available: bool = Field(default=False, description="Whether 1-on-1 mentorship is offered to top submissions")
    opportunity_type_offered: Optional[str] = Field(None, max_length=100, description="e.g. Referral consideration, interview, collaboration")
    opportunity_details: Optional[str] = Field(None, description="Details of potential professional outcomes")

    @field_validator("category", mode="before")
    @classmethod
    def parse_category(cls, v: Any) -> Any:
        if isinstance(v, str):
            v_clean = v.strip().lower().replace("_", " ")
            for member in ChallengeCategory:
                if member.value.lower() == v_clean:
                    return member
        return v

    @field_validator("difficulty_level", mode="before")
    @classmethod
    def parse_difficulty(cls, v: Any) -> Any:
        if isinstance(v, str):
            v_clean = v.strip().lower()
            for member in ChallengeDifficulty:
                if member.value.lower() == v_clean:
                    return member
        return v


class ChallengeCreate(ChallengeBase):
    @field_validator("required_skills")
    @classmethod
    def clean_skills(cls, v: List[str]) -> List[str]:
        return [s.strip() for s in v if s.strip()]


class ChallengeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    short_summary: Optional[str] = Field(None, min_length=5, max_length=255)
    problem_statement: Optional[str] = Field(None, min_length=10)
    category: Optional[ChallengeCategory] = None
    required_skills: Optional[List[str]] = None
    difficulty_level: Optional[ChallengeDifficulty] = None
    estimated_effort: Optional[str] = None
    submission_instructions: Optional[str] = None
    evaluation_criteria: Optional[List[Dict[str, Any]]] = None
    deadline: Optional[datetime] = None
    organization_name: Optional[str] = None
    reward_description: Optional[str] = None
    mentorship_available: Optional[bool] = None
    opportunity_type_offered: Optional[str] = None
    opportunity_details: Optional[str] = None

    @field_validator("category", mode="before")
    @classmethod
    def parse_category(cls, v: Any) -> Any:
        if isinstance(v, str):
            v_clean = v.strip().lower().replace("_", " ")
            for member in ChallengeCategory:
                if member.value.lower() == v_clean:
                    return member
        return v

    @field_validator("difficulty_level", mode="before")
    @classmethod
    def parse_difficulty(cls, v: Any) -> Any:
        if isinstance(v, str):
            v_clean = v.strip().lower()
            for member in ChallengeDifficulty:
                if member.value.lower() == v_clean:
                    return member
        return v


class ChallengeResponse(ChallengeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creator_user_id: int
    status: ChallengeStatus
    published_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    submissions_count: int = 0
    creator_name: Optional[str] = None
    creator_role: Optional[str] = None


class ChallengeListResponse(BaseModel):
    items: List[ChallengeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# --- Submission Schemas ---

class SubmissionBase(BaseModel):
    submission_description: str = Field(..., min_length=10, description="Overview of approach, trade-offs, and implementation details")
    repository_url: str = Field(..., description="Link to open-source repository (GitHub, GitLab, etc.)")
    demo_url: Optional[str] = Field(None, description="Optional live demo URL")
    supporting_evidence_urls: List[str] = Field(default_factory=list, description="Links to benchmarks, design docs, or reports")
    attachment_references: List[str] = Field(default_factory=list, description="External artifact references")

    @field_validator("repository_url")
    @classmethod
    def validate_repo(cls, v: str) -> str:
        res = validate_web_url(v, "repository_url")
        assert res is not None
        return res

    @field_validator("demo_url")
    @classmethod
    def validate_demo(cls, v: Optional[str]) -> Optional[str]:
        return validate_web_url(v, "demo_url")

    @field_validator("supporting_evidence_urls")
    @classmethod
    def validate_evidence(cls, v: List[str]) -> List[str]:
        cleaned = []
        for u in v:
            res = validate_web_url(u, "supporting_evidence_url")
            if res:
                cleaned.append(res)
        return cleaned


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(BaseModel):
    submission_description: Optional[str] = Field(None, min_length=10)
    repository_url: Optional[str] = None
    demo_url: Optional[str] = None
    supporting_evidence_urls: Optional[List[str]] = None
    attachment_references: Optional[List[str]] = None

    @field_validator("repository_url")
    @classmethod
    def validate_repo(cls, v: Optional[str]) -> Optional[str]:
        return validate_web_url(v, "repository_url")

    @field_validator("demo_url")
    @classmethod
    def validate_demo(cls, v: Optional[str]) -> Optional[str]:
        return validate_web_url(v, "demo_url")


class SubmissionResponse(SubmissionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    challenge_id: int
    student_user_id: int
    status: SubmissionStatus
    created_at: datetime
    updated_at: datetime

    student_name: Optional[str] = None
    challenge_title: Optional[str] = None
    reviews_count: int = 0
    average_score: Optional[float] = None


# --- Review Schemas ---

class ReviewCreate(BaseModel):
    technical_feedback: str = Field(..., min_length=10, description="Constructive technical feedback and critique")
    score: float = Field(..., ge=0.0, le=100.0, description="Evaluation score from 0.0 to 100.0")
    evaluation_criterion_results: List[Dict[str, Any]] = Field(default_factory=list, description="Per-criterion rubric scores")
    strengths: List[str] = Field(default_factory=list, description="Observed technical strengths")
    areas_for_improvement: List[str] = Field(default_factory=list, description="Actionable improvement feedback")
    status: ReviewStatus = Field(default=ReviewStatus.COMPLETED, description="Review completion status")

    @field_validator("status", mode="before")
    @classmethod
    def parse_status(cls, v: Any) -> Any:
        if isinstance(v, str):
            v_clean = v.strip().lower()
            for member in ReviewStatus:
                if member.value.lower() == v_clean:
                    return member
        return v


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    submission_id: int
    reviewer_user_id: int
    technical_feedback: str
    score: float
    evaluation_criterion_results: List[Dict[str, Any]]
    strengths: List[str]
    areas_for_improvement: List[str]
    status: ReviewStatus
    created_at: datetime
    updated_at: datetime

    reviewer_name: Optional[str] = None


# --- Outcome Schemas ---

class OutcomeCreate(BaseModel):
    student_user_id: int = Field(..., description="Recipient student user ID")
    submission_id: int = Field(..., description="Linked submission ID")
    outcome_type: OutcomeType = Field(..., description="Category of professional outcome")
    title: str = Field(..., min_length=3, max_length=150, description="Short title of the recognition or offer")
    details: Optional[str] = Field(None, description="Specific terms or next steps for this outcome")
    skills_demonstrated: List[str] = Field(default_factory=list, description="Skills verified through this submission")

    @field_validator("outcome_type", mode="before")
    @classmethod
    def parse_outcome_type(cls, v: Any) -> Any:
        if isinstance(v, str):
            v_clean = v.strip().lower()
            for member in OutcomeType:
                if member.value.lower() == v_clean:
                    return member
        return v


class OutcomeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    challenge_id: int
    submission_id: int
    student_user_id: int
    granted_by_user_id: int
    outcome_type: OutcomeType
    title: str
    details: Optional[str] = None
    skills_demonstrated: List[str]
    challenge_title: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# --- Recommendation Schemas ---

class ChallengeRecommendationItem(BaseModel):
    challenge: ChallengeResponse
    relevance_score: float = Field(..., ge=0.0, le=100.0)
    matched_skills: List[str]
    missing_skills: List[str]
    match_reasons: List[str]
    difficulty_fit: str


class ChallengeRecommendationsResponse(BaseModel):
    user_id: int
    total: int
    recommendations: List[ChallengeRecommendationItem]
    disclaimer: str = (
        "Challenge recommendations are deterministic indicators of skill and category alignment, "
        "not guarantees of selection or employment."
    )

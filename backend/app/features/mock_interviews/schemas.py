from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator


# ==========================================
# 1. Interviewer Verification & Profile Schemas
# ==========================================

class InterviewerApplicationRequest(BaseModel):
    institution_affiliation: str = Field(..., min_length=2, max_length=150, description="Alma mater or institutional affiliation")
    headline: Optional[str] = Field(None, max_length=255, description="Professional headline")
    bio: Optional[str] = Field(None, description="Short biography")
    current_company: Optional[str] = Field(None, max_length=150, description="Current company or startup")
    job_title: Optional[str] = Field(None, max_length=150, description="Current role or job title")
    years_of_experience: float = Field(0.0, ge=0.0, le=50.0, description="Years of professional experience")
    primary_domain: str = Field(..., min_length=2, max_length=100, description="Core domain of expertise")
    categories: List[str] = Field(..., min_length=1, description="Interview categories willing to conduct")
    evidence_links: List[str] = Field(default_factory=list, description="Links to verified credentials, LinkedIn, GitHub, or portfolio")
    available_slots: List[str] = Field(default_factory=list, description="Available date/time slots")
    preferred_capsule_duration_seconds: int = Field(90, ge=60, le=600, description="Capsule duration in seconds (default 90)")

    @field_validator("categories")
    @classmethod
    def validate_categories(cls, v: List[str]) -> List[str]:
        valid = {
            "technical_fundamentals",
            "coding_problem_solving",
            "behavioral",
            "communication_clarity",
            "role_specific",
            "project_portfolio"
        }
        for cat in v:
            if cat not in valid:
                raise ValueError(f"Invalid category '{cat}'. Valid categories are: {sorted(list(valid))}")
        return v


class InterviewerVerificationUpdateRequest(BaseModel):
    status: str = Field(..., description="'approved', 'suspended', 'revoked', or 'pending'")
    verification_notes: Optional[str] = Field(None, description="Confidential reviewer notes")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ("approved", "suspended", "revoked", "pending"):
            raise ValueError("Status must be 'approved', 'suspended', 'revoked', or 'pending'")
        return v


class InterviewerPublicProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_name: str
    headline: Optional[str] = None
    bio: Optional[str] = None
    current_company: Optional[str] = None
    job_title: Optional[str] = None
    years_of_experience: float
    primary_domain: str
    institution_affiliation: str
    categories: List[str]
    verification_status: str
    is_available: bool
    available_slots: List[str]
    preferred_capsule_duration_seconds: int
    total_completed_interviews: int
    average_rating: float
    total_reviews_count: int
    cancellation_rate: float
    created_at: datetime


class InterviewerSearchResponse(BaseModel):
    items: List[InterviewerPublicProfileResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ==========================================
# 2. Question & Rubric Schemas
# ==========================================

class QuestionCreateRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    question_text: str = Field(..., min_length=15, description="The 90-second interview prompt/question")
    category: str = Field(..., description="Interview category")
    target_role: Optional[str] = Field(None, max_length=100)
    experience_level: str = Field("entry_level", description="'entry_level', 'mid_level', 'senior', or 'all'")
    suggested_duration_seconds: int = Field(90, ge=30, le=300)
    expected_answer_hints: List[str] = Field(default_factory=list, description="Key points to evaluate in 90 seconds")
    rubric_override: Optional[Dict[str, Any]] = Field(None, description="Custom rubric dimensions")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        valid = {
            "technical_fundamentals",
            "coding_problem_solving",
            "behavioral",
            "communication_clarity",
            "role_specific",
            "project_portfolio"
        }
        if v not in valid:
            raise ValueError(f"Category '{v}' not recognized. Allowed: {sorted(list(valid))}")
        return v


class QuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_user_id: Optional[int]
    author_name: Optional[str] = None
    author_type: str
    title: str
    question_text: str
    category: str
    target_role: Optional[str]
    experience_level: str
    suggested_duration_seconds: int
    is_approved: bool
    evaluation_rubric_template: Dict[str, Any]
    expected_answer_hints: List[str]
    times_used: int
    created_at: datetime


class AIQuestionGenerateRequest(BaseModel):
    category: str
    target_role: str = Field("Software Engineer", max_length=100)
    experience_level: str = Field("entry_level", max_length=50)
    topic_focus: Optional[str] = Field(None, description="Optional focus area (e.g. Distributed caching)")


# ==========================================
# 3. Session Lifecycle Schemas
# ==========================================

class SessionRequestCreate(BaseModel):
    interviewer_user_id: int = Field(..., description="Target verified alumni interviewer user ID")
    interview_category: str = Field(..., description="Interview category")
    target_role: str = Field(..., min_length=2, max_length=100, description="Target career role")
    experience_level: str = Field("entry_level", max_length=50)
    question_id: Optional[int] = Field(None, description="Optional specific approved question ID")
    scheduled_at: Optional[datetime] = Field(None, description="Requested session timestamp")
    student_note: Optional[str] = Field(None, max_length=500, description="Notes on what you'd like to practice")
    recording_consent: bool = Field(False, description="Explicit consent for recording session (default false)")


class SessionRespondRequest(BaseModel):
    action: str = Field(..., description="'accept' or 'decline'")
    decline_reason: Optional[str] = Field(None, description="Reason if declining")

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: str) -> str:
        if v not in ("accept", "decline"):
            raise ValueError("Action must be 'accept' or 'decline'")
        return v


class SessionScheduleRequest(BaseModel):
    scheduled_at: datetime = Field(..., description="Confirmed interview timestamp")
    session_format: str = Field("virtual_capsule", description="'virtual_capsule', 'audio_capsule', or 'async_video_capsule'")


class SessionCancelRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=300, description="Reason for cancellation")


class SessionDisputeRequest(BaseModel):
    reason: str = Field(..., min_length=10, max_length=1000, description="Detailed explanation of the issue or dispute")


# ==========================================
# 4. Feedback & Student Review Schemas
# ==========================================

class InterviewFeedbackSubmitRequest(BaseModel):
    rubric_scores: Dict[str, float] = Field(
        ...,
        description="Dimension scores (1.0 to 5.0) e.g. {'technical_correctness': 4.0, 'reasoning_approach': 4.5}"
    )
    overall_score: float = Field(..., ge=1.0, le=5.0, description="Overall performance score (1.0 to 5.0)")
    strengths: List[str] = Field(..., min_length=1, description="At least one evidence-based strength observed")
    areas_for_improvement: List[str] = Field(..., min_length=1, description="At least one actionable improvement area")
    actionable_recommendations: str = Field(..., min_length=15, description="Concrete next steps for the student")
    interviewer_private_notes: Optional[str] = Field(None, description="Confidential interviewer notes")
    ai_assisted: bool = Field(False, description="Whether AI notes or transcript assistance was consulted")
    ai_assistance_summary: Optional[str] = Field(None, description="Clearly labeled AI summary if used")


class InterviewFeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    interviewer_id: int
    student_id: int
    interviewer_name: Optional[str] = None
    student_name: Optional[str] = None
    rubric_scores: Dict[str, float]
    overall_score: float
    strengths: List[str]
    areas_for_improvement: List[str]
    actionable_recommendations: str
    interviewer_private_notes: Optional[str] = None
    ai_assisted: bool
    ai_assistance_summary: Optional[str] = None
    submitted_at: datetime


class StudentReviewSubmitRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Interviewer rating (1 to 5 stars)")
    usefulness_feedback: Optional[str] = Field(None, max_length=1000, description="Qualitative feedback on session usefulness")
    would_recommend: bool = Field(True, description="Would recommend this alumnus to peers")
    reported_issue: bool = Field(False, description="Flag inappropriate conduct")
    dispute_reason: Optional[str] = Field(None, description="Details if issue reported")


class StudentReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    student_id: int
    interviewer_id: int
    rating: int
    usefulness_feedback: Optional[str] = None
    would_recommend: bool
    reported_issue: bool
    submitted_at: datetime


# ==========================================
# 5. Session Detail & Listing Schemas
# ==========================================

class SessionDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    student_name: Optional[str] = None
    student_role: Optional[str] = None
    interviewer_id: int
    interviewer_name: Optional[str] = None
    interviewer_company: Optional[str] = None
    interviewer_title: Optional[str] = None
    interviewer_avatar_url: Optional[str] = None

    question_id: Optional[int] = None
    question_title: Optional[str] = None
    question_text: Optional[str] = None

    status: str
    interview_category: str
    target_role: str
    experience_level: str
    session_duration_seconds: int
    session_format: str
    scheduled_at: Optional[datetime] = None

    student_note: Optional[str] = None
    decline_reason: Optional[str] = None
    cancellation_reason: Optional[str] = None
    dispute_reason: Optional[str] = None

    student_consent: bool
    recording_consent: bool
    recording_url: Optional[str] = None

    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    karma_awarded: bool
    karma_points: int

    feedback: Optional[InterviewFeedbackResponse] = None
    review: Optional[StudentReviewResponse] = None

    created_at: datetime
    updated_at: datetime


class SessionListResponse(BaseModel):
    items: List[SessionDetailResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

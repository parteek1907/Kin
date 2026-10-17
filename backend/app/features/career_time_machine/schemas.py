from typing import List, Optional, Any, Dict
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict, model_validator
from app.features.career_time_machine.models import JourneyVisibility, JourneyVerificationStatus


class CareerJourneyBase(BaseModel):
    job_title: str = Field(..., min_length=1, max_length=150, description="Title of the role")
    company: str = Field(..., min_length=1, max_length=150, description="Company or organization")
    industry: str = Field(..., min_length=1, max_length=100, description="Industry sector")
    start_date: date = Field(..., description="Date when this role started")
    end_date: Optional[date] = Field(None, description="Date when this role ended (None if current)")
    is_current: bool = Field(default=False, description="Whether this is the current active role")
    description: Optional[str] = Field(None, max_length=5000, description="Role summary and responsibilities")
    skills_used: List[str] = Field(default_factory=list, description="Skills used or acquired in this role")
    projects_or_achievements: List[str] = Field(default_factory=list, description="Key projects or achievements")
    career_transition_notes: Optional[str] = Field(None, max_length=2000, description="Notes on how transition into this role occurred")
    visibility: JourneyVisibility = Field(default=JourneyVisibility.PUBLIC, description="Record visibility")


class CareerJourneyCreate(CareerJourneyBase):
    @model_validator(mode="after")
    def validate_dates(self) -> "CareerJourneyCreate":
        if self.is_current and self.end_date is not None:
            # If current role is indicated, end_date must be cleared or cannot be before start_date
            self.end_date = None
        if self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("end_date cannot be earlier than start_date")
        return self


class CareerJourneyUpdate(BaseModel):
    job_title: Optional[str] = Field(None, min_length=1, max_length=150)
    company: Optional[str] = Field(None, min_length=1, max_length=150)
    industry: Optional[str] = Field(None, min_length=1, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    description: Optional[str] = Field(None, max_length=5000)
    skills_used: Optional[List[str]] = None
    projects_or_achievements: Optional[List[str]] = None
    career_transition_notes: Optional[str] = Field(None, max_length=2000)
    visibility: Optional[JourneyVisibility] = None

    @model_validator(mode="after")
    def validate_dates_update(self) -> "CareerJourneyUpdate":
        if self.start_date is not None and self.end_date is not None:
            if self.end_date < self.start_date:
                raise ValueError("end_date cannot be earlier than start_date")
        return self


class CareerJourneyResponse(CareerJourneyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    verification_status: JourneyVerificationStatus
    created_at: datetime
    updated_at: datetime

    # Associated author info (when exposed)
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    author_headline: Optional[str] = None


class CareerTimelineStage(BaseModel):
    stage_number: int
    journey_id: int
    job_title: str
    company: str
    industry: str
    start_date: date
    end_date: Optional[date]
    is_current: bool
    duration_months: Optional[int]
    skills_used: List[str]
    projects_or_achievements: List[str]
    career_transition_notes: Optional[str]
    verification_status: str


class CareerTimelineResponse(BaseModel):
    user_id: int
    professional_name: str
    professional_headline: Optional[str] = None
    current_role: Optional[str] = None
    total_stages: int
    stages: List[CareerTimelineStage]


class CareerExploreResponse(BaseModel):
    items: List[CareerJourneyResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SkillGapRequest(BaseModel):
    target_role: str = Field(..., min_length=1, max_length=150, description="Target career role (e.g. Machine Learning Engineer)")
    current_skills: List[str] = Field(default_factory=list, description="Current skills of the student/applicant")
    experience_level: Optional[str] = Field(None, description="Current experience level (e.g. Student, Entry, Mid)")
    industry_preference: Optional[str] = Field(None, description="Optional target industry filter")


class SkillPriorityItem(BaseModel):
    skill: str
    priority: str = Field(..., description="High, Medium, or Low")
    reason: str
    frequency_in_target_records: int
    percentage_of_profiles: float


class ProjectEvidenceItem(BaseModel):
    project_or_achievement: str
    context_role: str
    context_company: str


class SkillGapResponse(BaseModel):
    target_role: str
    current_skills: List[str]
    matching_skills: List[str]
    potential_skill_gaps: List[str]
    suggested_priorities: List[SkillPriorityItem]
    relevant_projects_or_experiences: List[ProjectEvidenceItem]
    observed_transition_notes: List[str]
    analyzed_records_count: int
    disclaimer: str = (
        "Suggestions are strictly based on historical career records from alumni in our database. "
        "Career progression is non-linear and outcomes are not guaranteed."
    )


class CareerInsightsResponse(BaseModel):
    target_query: str
    total_journeys_analyzed: int
    common_entry_roles: List[str]
    common_transitions: List[Dict[str, Any]]
    in_demand_skills: List[Dict[str, Any]]
    average_duration_per_stage_months: Optional[float]
    observed_facts: List[str]
    inferred_patterns: List[str]
    methodology: str
    ai_enhanced: bool = False
    disclaimer: str = (
        "Insights reflect empirical records observed in the alumni network database. "
        "They distinguish observed facts from inferred statistical patterns."
    )

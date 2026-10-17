from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.profile import PlatformRole, ProfileVisibility


class ProfileBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=150, description="User's full name")
    role: PlatformRole = Field(default=PlatformRole.STUDENT, description="Platform role")
    headline: Optional[str] = Field(None, max_length=255, description="Professional headline")
    biography: Optional[str] = Field(None, max_length=5000, description="User biography")
    skills: List[str] = Field(default_factory=list, description="List of professional skills")
    education: Optional[List[Any]] = Field(default_factory=list, description="Education history")
    industry: Optional[str] = Field(None, max_length=100, description="Primary industry")
    current_organization: Optional[str] = Field(None, max_length=150, description="Current organization or university")
    student_id: Optional[str] = Field(None, max_length=100, description="Verified Student Roll Number / ID")
    business_id: Optional[str] = Field(None, max_length=100, description="Verified Business / Corporate ID")
    verification_status: Optional[str] = Field("unverified", max_length=50, description="Identity verification status")
    years_of_experience: float = Field(default=0.0, ge=0.0, le=70.0, description="Years of professional experience")
    visibility: ProfileVisibility = Field(default=ProfileVisibility.PUBLIC, description="Profile privacy setting")


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=150)
    headline: Optional[str] = Field(None, max_length=255)
    biography: Optional[str] = Field(None, max_length=5000)
    skills: Optional[List[str]] = None
    education: Optional[List[Any]] = None
    industry: Optional[str] = Field(None, max_length=100)
    current_organization: Optional[str] = Field(None, max_length=150)
    student_id: Optional[str] = Field(None, max_length=100)
    business_id: Optional[str] = Field(None, max_length=100)
    verification_status: Optional[str] = Field(None, max_length=50)
    years_of_experience: Optional[float] = Field(None, ge=0.0, le=70.0)
    visibility: Optional[ProfileVisibility] = None
    # Users can change their role within permitted platform roles, but cannot escalate to admin
    role: Optional[PlatformRole] = None


class ProfileResponse(ProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

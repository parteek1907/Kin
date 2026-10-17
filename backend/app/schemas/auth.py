from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.profile import PlatformRole
from app.schemas.profile import ProfileResponse


class UserRegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="Unique email address")
    password: str = Field(..., min_length=8, max_length=72, description="Password (8-72 characters)")
    full_name: str = Field(..., min_length=1, max_length=150, description="Full display name")
    role: PlatformRole = Field(default=PlatformRole.STUDENT, description="Platform role")
    headline: Optional[str] = Field(None, max_length=255, description="Initial headline")
    skills: Optional[List[str]] = Field(default_factory=list, description="Initial skills")
    industry: Optional[str] = Field(None, max_length=100, description="Industry sector")


class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="User password")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    is_active: bool
    created_at: datetime
    profile: Optional[ProfileResponse] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

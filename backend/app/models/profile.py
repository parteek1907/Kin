import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Float, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class PlatformRole(str, enum.Enum):
    STUDENT = "Student"
    ALUMNI = "Alumni"
    FACULTY = "Faculty"
    FOUNDER = "Founder"
    RECRUITER = "Recruiter"


class ProfileVisibility(str, enum.Enum):
    PUBLIC = "public"
    NETWORK_ONLY = "network_only"
    PRIVATE = "private"


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    full_name = Column(String(150), nullable=False)
    role = Column(String(50), default=PlatformRole.STUDENT.value, nullable=False)
    headline = Column(String(255), nullable=True)
    biography = Column(Text, nullable=True)
    skills = Column(JSON, default=list, nullable=False)
    education = Column(JSON, default=list, nullable=True)
    industry = Column(String(100), nullable=True, index=True)
    current_organization = Column(String(150), nullable=True)
    years_of_experience = Column(Float, default=0.0, nullable=False)
    visibility = Column(String(30), default=ProfileVisibility.PUBLIC.value, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="profile")

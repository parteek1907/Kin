import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Date, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class JourneyVisibility(str, enum.Enum):
    PUBLIC = "public"
    NETWORK_ONLY = "network_only"
    PRIVATE = "private"


class JourneyVerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    ALUMNI_VERIFIED = "alumni_verified"
    OFFICIAL_VERIFIED = "official_verified"


class CareerJourney(Base):
    __tablename__ = "career_journeys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    job_title = Column(String(150), nullable=False, index=True)
    company = Column(String(150), nullable=False)
    industry = Column(String(100), nullable=False, index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False, nullable=False)

    description = Column(Text, nullable=True)
    skills_used = Column(JSON, default=list, nullable=False)
    projects_or_achievements = Column(JSON, default=list, nullable=False)
    career_transition_notes = Column(Text, nullable=True)

    visibility = Column(String(30), default=JourneyVisibility.PUBLIC.value, nullable=False, index=True)
    verification_status = Column(String(30), default=JourneyVerificationStatus.UNVERIFIED.value, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="career_journeys")

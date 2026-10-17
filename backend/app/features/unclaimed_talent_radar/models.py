import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class OpportunityType(str, enum.Enum):
    INTERNSHIP = "internship"
    JOB = "job"
    RESEARCH_PROJECT = "research_project"
    TECHNICAL_CHALLENGE = "technical_challenge"
    MENTORSHIP = "mentorship"
    COLLABORATION = "collaboration"
    FELLOWSHIP = "fellowship"


class OpportunityStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"
    DRAFT = "draft"
    EXPIRED = "expired"


class OpportunityVisibility(str, enum.Enum):
    PUBLIC = "public"
    NETWORK_ONLY = "network_only"
    PRIVATE = "private"


class WorkplaceType(str, enum.Enum):
    REMOTE = "remote"
    ONSITE = "onsite"
    HYBRID = "hybrid"


class FeedbackType(str, enum.Enum):
    RELEVANT = "relevant"
    NOT_RELEVANT = "not_relevant"
    ALREADY_SKILLED = "already_skilled"
    INTERESTED_IN_INDUSTRY = "interested_in_industry"
    NOT_INTERESTED_IN_INDUSTRY = "not_interested_in_industry"


class Opportunity(Base):
    """
    Empirical opportunity record stored in the platform database.
    Represents actual internships, jobs, research positions, challenges, or collaborations.
    """
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False, index=True)
    organization = Column(String(150), nullable=False, index=True)
    opportunity_type = Column(String(50), default=OpportunityType.JOB.value, nullable=False, index=True)
    industry = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)

    required_skills = Column(JSON, default=list, nullable=False)
    preferred_skills = Column(JSON, default=list, nullable=False)

    experience_level = Column(String(50), default="All", nullable=False)
    min_years_experience = Column(Float, default=0.0, nullable=False)

    location = Column(String(150), nullable=True)
    workplace_type = Column(String(50), default=WorkplaceType.REMOTE.value, nullable=False)

    eligibility_criteria = Column(JSON, default=dict, nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=True, index=True)

    status = Column(String(30), default=OpportunityStatus.OPEN.value, nullable=False, index=True)
    visibility = Column(String(30), default=OpportunityVisibility.PUBLIC.value, nullable=False, index=True)

    learning_resources = Column(JSON, default=list, nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    creator = relationship("User", back_populates="created_opportunities")
    feedback = relationship("TalentRadarFeedback", back_populates="opportunity", cascade="all, delete-orphan")


class TalentRadarFeedback(Base):
    """
    User recommendation feedback for transparent personalization and ranking adjustments.
    """
    __tablename__ = "talent_radar_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)

    feedback_type = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "opportunity_id", name="uq_user_opportunity_feedback"),
    )

    # Relationships
    user = relationship("User", back_populates="radar_feedback")
    opportunity = relationship("Opportunity", back_populates="feedback")

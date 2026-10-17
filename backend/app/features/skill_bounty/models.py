"""
Database models and enums for Skill Bounty Network.
Enforces real-world challenge models, submissions, reviews, and explicit professional outcomes.
"""

import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChallengeCategory(str, enum.Enum):
    ARTIFICIAL_INTELLIGENCE = "Artificial Intelligence"
    MACHINE_LEARNING = "Machine Learning"
    DATA_SCIENCE = "Data Science"
    WEB_DEVELOPMENT = "Web Development"
    BACKEND_ENGINEERING = "Backend Engineering"
    ROBOTICS = "Robotics"
    AUTONOMOUS_VEHICLES = "Autonomous Vehicles"
    CYBERSECURITY = "Cybersecurity"
    PRODUCT_DESIGN = "Product Design"
    BUSINESS_AND_RESEARCH = "Business and Research"
    OTHER = "Other"


class ChallengeDifficulty(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    EXPERT = "Expert"


class ChallengeStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SubmissionStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    REVIEWED = "reviewed"
    WITHDRAWN = "withdrawn"


class ReviewStatus(str, enum.Enum):
    COMPLETED = "completed"
    DRAFT = "draft"


class OutcomeType(str, enum.Enum):
    FEEDBACK_RECEIVED = "feedback_received"
    PORTFOLIO_PROJECT = "portfolio_project"
    MENTORSHIP_OFFERED = "mentorship_offered"
    COLLABORATION_OFFERED = "collaboration_offered"
    INTERVIEW_OPPORTUNITY = "interview_opportunity"
    REFERRAL_OFFERED = "referral_offered"


class Challenge(Base):
    """
    Real-world technical challenge posted by professionals, alumni, founders, or recruiters.
    """
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    creator_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(150), nullable=False, index=True)
    short_summary = Column(String(255), nullable=False)
    problem_statement = Column(Text, nullable=False)
    category = Column(String(100), default=ChallengeCategory.BACKEND_ENGINEERING.value, nullable=False, index=True)

    required_skills = Column(JSON, default=list, nullable=False)
    difficulty_level = Column(String(50), default=ChallengeDifficulty.INTERMEDIATE.value, nullable=False, index=True)
    estimated_effort = Column(String(100), nullable=True)

    submission_instructions = Column(Text, nullable=True)
    evaluation_criteria = Column(JSON, default=list, nullable=False)

    deadline = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(String(30), default=ChallengeStatus.DRAFT.value, nullable=False, index=True)

    organization_name = Column(String(150), nullable=True, index=True)
    reward_description = Column(String(255), nullable=True)
    mentorship_available = Column(Boolean, default=False, nullable=False)
    opportunity_type_offered = Column(String(100), nullable=True)
    opportunity_details = Column(Text, nullable=True)

    published_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    creator = relationship("User", back_populates="challenges_created")
    submissions = relationship("ChallengeSubmission", back_populates="challenge", cascade="all, delete-orphan")
    outcomes = relationship("ChallengeOutcome", back_populates="challenge", cascade="all, delete-orphan")


class ChallengeSubmission(Base):
    """
    Submission submitted by a student or platform participant demonstrating their technical skills.
    """
    __tablename__ = "challenge_submissions"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    student_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    submission_description = Column(Text, nullable=False)
    repository_url = Column(String(500), nullable=False)
    demo_url = Column(String(500), nullable=True)
    supporting_evidence_urls = Column(JSON, default=list, nullable=False)
    attachment_references = Column(JSON, default=list, nullable=False)

    status = Column(String(30), default=SubmissionStatus.SUBMITTED.value, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    challenge = relationship("Challenge", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
    reviews = relationship("SubmissionReview", back_populates="submission", cascade="all, delete-orphan")
    outcomes = relationship("ChallengeOutcome", back_populates="submission", cascade="all, delete-orphan")


class SubmissionReview(Base):
    """
    Review and technical evaluation completed by the challenge creator or authorized reviewer.
    """
    __tablename__ = "submission_reviews"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("challenge_submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    technical_feedback = Column(Text, nullable=False)
    score = Column(Float, nullable=False)
    evaluation_criterion_results = Column(JSON, default=list, nullable=False)
    strengths = Column(JSON, default=list, nullable=False)
    areas_for_improvement = Column(JSON, default=list, nullable=False)

    status = Column(String(30), default=ReviewStatus.COMPLETED.value, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    submission = relationship("ChallengeSubmission", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews_authored")


class ChallengeOutcome(Base):
    """
    Explicit professional outcome awarded to a participant based on verified challenge performance.
    """
    __tablename__ = "challenge_outcomes"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_id = Column(Integer, ForeignKey("challenge_submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    granted_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    outcome_type = Column(String(50), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    details = Column(Text, nullable=True)
    skills_demonstrated = Column(JSON, default=list, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    challenge = relationship("Challenge", back_populates="outcomes")
    submission = relationship("ChallengeSubmission", back_populates="outcomes")
    student = relationship("User", foreign_keys=[student_user_id], back_populates="challenge_outcomes")
    granted_by = relationship("User", foreign_keys=[granted_by_user_id])

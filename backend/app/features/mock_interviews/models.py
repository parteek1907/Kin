import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class InterviewCategory(str, enum.Enum):
    TECHNICAL_FUNDAMENTALS = "technical_fundamentals"
    CODING_PROBLEM_SOLVING = "coding_problem_solving"
    BEHAVIORAL = "behavioral"
    COMMUNICATION_CLARITY = "communication_clarity"
    ROLE_SPECIFIC = "role_specific"
    PROJECT_PORTFOLIO = "project_portfolio"


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    SUSPENDED = "suspended"
    REVOKED = "revoked"


class SessionStatus(str, enum.Enum):
    REQUESTED = "requested"
    ACCEPTED = "accepted"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FEEDBACK_SUBMITTED = "feedback_submitted"
    DECLINED = "declined"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    DISPUTED = "disputed"


class QuestionAuthorType(str, enum.Enum):
    ALUMNI = "alumni"
    SYSTEM = "system"
    AI_ASSISTED = "ai_assisted"


class InterviewerProfile(Base):
    """
    Profile for an alumnus verified to conduct 90-second wisdom capsule mock interviews.
    Requires institutional affiliation and evidence-based vetting.
    """
    __tablename__ = "interviewer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    institution_affiliation = Column(String(150), nullable=False)
    headline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    current_company = Column(String(150), nullable=True)
    job_title = Column(String(150), nullable=True)
    years_of_experience = Column(Float, default=0.0, nullable=False)
    primary_domain = Column(String(100), nullable=False)
    categories = Column(JSON, default=list, nullable=False)  # List of InterviewCategory strings

    # Professional qualification evidence (e.g. portfolio, verified LinkedIn, credentials)
    evidence_links = Column(JSON, default=list, nullable=False)
    verification_notes = Column(Text, nullable=True)  # Admin only internal notes

    verification_status = Column(String(30), default=VerificationStatus.PENDING.value, nullable=False, index=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    is_available = Column(Boolean, default=True, nullable=False, index=True)
    available_slots = Column(JSON, default=list, nullable=False)
    preferred_capsule_duration_seconds = Column(Integer, default=90, nullable=False)

    # Performance & Reliability Metrics
    total_completed_interviews = Column(Integer, default=0, nullable=False)
    average_rating = Column(Float, default=0.0, nullable=False)
    total_reviews_count = Column(Integer, default=0, nullable=False)
    cancellation_rate = Column(Float, default=0.0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    verified_by = relationship("User", foreign_keys=[verified_by_user_id])


class InterviewQuestion(Base):
    """
    Curated and expert-authored questions for 90-second mock interview capsules.
    """
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    author_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    title = Column(String(200), nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    target_role = Column(String(100), nullable=True, index=True)
    experience_level = Column(String(50), default="entry_level", nullable=False)
    suggested_duration_seconds = Column(Integer, default=90, nullable=False)
    author_type = Column(String(30), default=QuestionAuthorType.ALUMNI.value, nullable=False)
    is_approved = Column(Boolean, default=True, nullable=False, index=True)

    # Category-specific structured evaluation guidelines
    evaluation_rubric_template = Column(JSON, default=dict, nullable=False)
    expected_answer_hints = Column(JSON, default=list, nullable=False)
    times_used = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    author = relationship("User", foreign_keys=[author_user_id])


class InterviewSession(Base):
    """
    Persistent interview session lifecycle tracking the student-interviewer interaction.
    """
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    interviewer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id", ondelete="SET NULL"), nullable=True, index=True)

    status = Column(String(30), default=SessionStatus.REQUESTED.value, nullable=False, index=True)
    interview_category = Column(String(50), nullable=False, index=True)
    target_role = Column(String(100), nullable=False)
    experience_level = Column(String(50), default="entry_level", nullable=False)

    session_duration_seconds = Column(Integer, default=90, nullable=False)
    session_format = Column(String(50), default="virtual_capsule", nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)

    student_note = Column(Text, nullable=True)
    decline_reason = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    # Privacy & Consent
    student_consent = Column(Boolean, default=True, nullable=False)
    recording_consent = Column(Boolean, default=False, nullable=False)
    recording_url = Column(String(255), nullable=True)

    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Community Karma
    karma_awarded = Column(Boolean, default=False, nullable=False)
    karma_points = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    interviewer = relationship("User", foreign_keys=[interviewer_id])
    question = relationship("InterviewQuestion")
    feedback = relationship("InterviewFeedback", uselist=False, back_populates="session", cascade="all, delete-orphan")
    review = relationship("InterviewStudentReview", uselist=False, back_populates="session", cascade="all, delete-orphan")


class InterviewFeedback(Base):
    """
    Credible, human-authored evaluation and scoring provided by the alumni interviewer.
    """
    __tablename__ = "interview_feedback"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    interviewer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Rubric scores: technical_correctness, reasoning_approach, communication, structure_clarity, practical_experience (1 to 5)
    rubric_scores = Column(JSON, nullable=False)
    overall_score = Column(Float, nullable=False)

    strengths = Column(JSON, nullable=False)  # List of strong points
    areas_for_improvement = Column(JSON, nullable=False)  # List of improvement points
    actionable_recommendations = Column(Text, nullable=False)
    interviewer_private_notes = Column(Text, nullable=True)

    ai_assisted = Column(Boolean, default=False, nullable=False)
    ai_assistance_summary = Column(Text, nullable=True)

    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    session = relationship("InterviewSession", back_populates="feedback")
    interviewer = relationship("User", foreign_keys=[interviewer_id])
    student = relationship("User", foreign_keys=[student_id])


class InterviewStudentReview(Base):
    """
    Post-session student feedback and rating on interviewer usefulness and professionalism.
    """
    __tablename__ = "interview_student_reviews"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    interviewer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    rating = Column(Integer, nullable=False)  # 1 to 5
    usefulness_feedback = Column(Text, nullable=True)
    would_recommend = Column(Boolean, default=True, nullable=False)
    reported_issue = Column(Boolean, default=False, nullable=False)
    dispute_reason = Column(Text, nullable=True)

    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    session = relationship("InterviewSession", back_populates="review")
    student = relationship("User", foreign_keys=[student_id])
    interviewer = relationship("User", foreign_keys=[interviewer_id])

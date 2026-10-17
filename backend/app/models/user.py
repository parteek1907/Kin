from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    career_journeys = relationship("CareerJourney", back_populates="user", cascade="all, delete-orphan")
    connection_policies = relationship("ConnectionPolicy", back_populates="owner", cascade="all, delete-orphan")
    sent_connection_requests = relationship("ConnectionRequest", foreign_keys="ConnectionRequest.sender_id", back_populates="sender", cascade="all, delete-orphan")
    received_connection_requests = relationship("ConnectionRequest", foreign_keys="ConnectionRequest.recipient_id", back_populates="recipient", cascade="all, delete-orphan")
    blocked_users = relationship("UserBlock", foreign_keys="UserBlock.blocker_id", back_populates="blocker", cascade="all, delete-orphan")
    blocked_by_users = relationship("UserBlock", foreign_keys="UserBlock.blocked_id", back_populates="blocked", cascade="all, delete-orphan")
    notifications = relationship("Notification", foreign_keys="Notification.user_id", back_populates="recipient", cascade="all, delete-orphan")
    created_opportunities = relationship("Opportunity", back_populates="creator")
    radar_feedback = relationship("TalentRadarFeedback", back_populates="user", cascade="all, delete-orphan")
    challenges_created = relationship("Challenge", back_populates="creator", cascade="all, delete-orphan")
    submissions = relationship("ChallengeSubmission", back_populates="student", cascade="all, delete-orphan")
    reviews_authored = relationship("SubmissionReview", back_populates="reviewer", cascade="all, delete-orphan")
    challenge_outcomes = relationship("ChallengeOutcome", foreign_keys="[ChallengeOutcome.student_user_id]", back_populates="student", cascade="all, delete-orphan")
    kin_reputation_summary = relationship("KinReputationSummary", back_populates="user", uselist=False, cascade="all, delete-orphan")
    kin_ledger_entries = relationship("KinLedgerEntry", foreign_keys="KinLedgerEntry.user_id", back_populates="user", cascade="all, delete-orphan")
    ghost_entitlement = relationship("GhostEntitlement", back_populates="user", uselist=False, cascade="all, delete-orphan")



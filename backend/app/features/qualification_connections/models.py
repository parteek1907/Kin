from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, JSON,
    UniqueConstraint, CheckConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ConnectionPolicy(Base):
    __tablename__ = "connection_policies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    policy_name = Column(String(150), nullable=False)
    required_skills = Column(JSON, default=list, nullable=False)  # Mandatory skills
    preferred_skills = Column(JSON, default=list, nullable=False)  # Relevance boosters
    relevant_industries = Column(JSON, default=list, nullable=False)  # Target domains/industries
    min_project_count = Column(Integer, default=0, nullable=False)  # Minimum relevant projects
    min_years_experience = Column(Float, default=0.0, nullable=False)  # Minimum experience in years
    qualification_requirements = Column(JSON, default=list, nullable=True)  # Education / degrees

    # Security rule: Automatic acceptance must always be explicitly enabled by recipient (default: False)
    auto_accept_enabled = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="connection_policies")
    connection_requests = relationship("ConnectionRequest", back_populates="policy")


class ConnectionRequest(Base):
    __tablename__ = "connection_requests"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    policy_id = Column(Integer, ForeignKey("connection_policies.id", ondelete="SET NULL"), nullable=True)

    status = Column(String(30), default="pending", nullable=False, index=True)  # pending, accepted, rejected
    auto_accepted = Column(Boolean, default=False, nullable=False)
    message = Column(Text, nullable=True)
    evaluation_summary = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        CheckConstraint("sender_id != recipient_id", name="check_sender_not_recipient"),
    )

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_connection_requests")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_connection_requests")
    policy = relationship("ConnectionPolicy", back_populates="connection_requests")


class Connection(Base):
    __tablename__ = "user_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id_1 = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id_2 = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    policy_id = Column(Integer, ForeignKey("connection_policies.id", ondelete="SET NULL"), nullable=True)
    established_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        CheckConstraint("user_id_1 < user_id_2", name="check_user_order"),
        UniqueConstraint("user_id_1", "user_id_2", name="uq_user_connections_pair"),
    )

    user_1 = relationship("User", foreign_keys=[user_id_1])
    user_2 = relationship("User", foreign_keys=[user_id_2])


class PolicyEvaluationLog(Base):
    __tablename__ = "policy_evaluation_logs"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("connection_policies.id", ondelete="SET NULL"), nullable=True, index=True)
    evaluator_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    eligibility_status = Column(String(50), nullable=False)  # qualified, not_qualified, insufficient_data
    auto_accept_eligible = Column(Boolean, nullable=False)
    manual_review_required = Column(Boolean, nullable=False)
    match_score = Column(Float, nullable=False)

    criteria_satisfied = Column(JSON, default=list, nullable=False)
    criteria_not_satisfied = Column(JSON, default=list, nullable=False)
    missing_information = Column(JSON, default=list, nullable=False)
    explanation = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

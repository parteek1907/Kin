"""0008_mock_interviews

Revision ID: 0008_mock_interviews
Revises: 0007_kin_ghost_mode
Create Date: 2026-10-17 19:05:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0008_mock_interviews"
down_revision: Union[str, None] = "0007_kin_ghost_mode"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. interviewer_profiles
    op.create_table(
        "interviewer_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("institution_affiliation", sa.String(length=150), nullable=False),
        sa.Column("headline", sa.String(length=255), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("current_company", sa.String(length=150), nullable=True),
        sa.Column("job_title", sa.String(length=150), nullable=True),
        sa.Column("years_of_experience", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("primary_domain", sa.String(length=100), nullable=False),
        sa.Column("categories", sa.JSON(), nullable=False),
        sa.Column("evidence_links", sa.JSON(), nullable=False),
        sa.Column("verification_notes", sa.Text(), nullable=True),
        sa.Column("verification_status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verified_by_user_id", sa.Integer(), nullable=True),
        sa.Column("is_available", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("available_slots", sa.JSON(), nullable=False),
        sa.Column("preferred_capsule_duration_seconds", sa.Integer(), nullable=False, server_default="90"),
        sa.Column("total_completed_interviews", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("average_rating", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("total_reviews_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("cancellation_rate", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["verified_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("user_id", name="uq_interviewer_profile_user_id")
    )
    op.create_index("ix_interviewer_profiles_id", "interviewer_profiles", ["id"])
    op.create_index("ix_interviewer_profiles_user_id", "interviewer_profiles", ["user_id"])
    op.create_index("ix_interviewer_profiles_verification_status", "interviewer_profiles", ["verification_status"])
    op.create_index("ix_interviewer_profiles_is_available", "interviewer_profiles", ["is_available"])

    # 2. interview_questions
    op.create_table(
        "interview_questions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("author_user_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("target_role", sa.String(length=100), nullable=True),
        sa.Column("experience_level", sa.String(length=50), nullable=False, server_default="entry_level"),
        sa.Column("suggested_duration_seconds", sa.Integer(), nullable=False, server_default="90"),
        sa.Column("author_type", sa.String(length=30), nullable=False, server_default="alumni"),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("evaluation_rubric_template", sa.JSON(), nullable=False),
        sa.Column("expected_answer_hints", sa.JSON(), nullable=False),
        sa.Column("times_used", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["author_user_id"], ["users.id"], ondelete="SET NULL")
    )
    op.create_index("ix_interview_questions_id", "interview_questions", ["id"])
    op.create_index("ix_interview_questions_category", "interview_questions", ["category"])
    op.create_index("ix_interview_questions_target_role", "interview_questions", ["target_role"])
    op.create_index("ix_interview_questions_is_approved", "interview_questions", ["is_approved"])

    # 3. interview_sessions
    op.create_table(
        "interview_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("interviewer_id", sa.Integer(), nullable=False),
        sa.Column("question_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="requested"),
        sa.Column("interview_category", sa.String(length=50), nullable=False),
        sa.Column("target_role", sa.String(length=100), nullable=False),
        sa.Column("experience_level", sa.String(length=50), nullable=False, server_default="entry_level"),
        sa.Column("session_duration_seconds", sa.Integer(), nullable=False, server_default="90"),
        sa.Column("session_format", sa.String(length=50), nullable=False, server_default="virtual_capsule"),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("student_note", sa.Text(), nullable=True),
        sa.Column("decline_reason", sa.Text(), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("student_consent", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("recording_consent", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("recording_url", sa.String(length=255), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("karma_awarded", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("karma_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["interviewer_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["question_id"], ["interview_questions.id"], ondelete="SET NULL")
    )
    op.create_index("ix_interview_sessions_id", "interview_sessions", ["id"])
    op.create_index("ix_interview_sessions_student_id", "interview_sessions", ["student_id"])
    op.create_index("ix_interview_sessions_interviewer_id", "interview_sessions", ["interviewer_id"])
    op.create_index("ix_interview_sessions_status", "interview_sessions", ["status"])

    # 4. interview_feedback
    op.create_table(
        "interview_feedback",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.Integer(), nullable=False),
        sa.Column("interviewer_id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("rubric_scores", sa.JSON(), nullable=False),
        sa.Column("overall_score", sa.Float(), nullable=False),
        sa.Column("strengths", sa.JSON(), nullable=False),
        sa.Column("areas_for_improvement", sa.JSON(), nullable=False),
        sa.Column("actionable_recommendations", sa.Text(), nullable=False),
        sa.Column("interviewer_private_notes", sa.Text(), nullable=True),
        sa.Column("ai_assisted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("ai_assistance_summary", sa.Text(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["session_id"], ["interview_sessions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["interviewer_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("session_id", name="uq_interview_feedback_session_id")
    )
    op.create_index("ix_interview_feedback_id", "interview_feedback", ["id"])
    op.create_index("ix_interview_feedback_session_id", "interview_feedback", ["session_id"])
    op.create_index("ix_interview_feedback_interviewer_id", "interview_feedback", ["interviewer_id"])
    op.create_index("ix_interview_feedback_student_id", "interview_feedback", ["student_id"])

    # 5. interview_student_reviews
    op.create_table(
        "interview_student_reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("interviewer_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("usefulness_feedback", sa.Text(), nullable=True),
        sa.Column("would_recommend", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("reported_issue", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("dispute_reason", sa.Text(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["session_id"], ["interview_sessions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["interviewer_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("session_id", name="uq_interview_student_reviews_session_id")
    )
    op.create_index("ix_interview_student_reviews_id", "interview_student_reviews", ["id"])
    op.create_index("ix_interview_student_reviews_session_id", "interview_student_reviews", ["session_id"])
    op.create_index("ix_interview_student_reviews_student_id", "interview_student_reviews", ["student_id"])
    op.create_index("ix_interview_student_reviews_interviewer_id", "interview_student_reviews", ["interviewer_id"])


def downgrade() -> None:
    op.drop_table("interview_student_reviews")
    op.drop_table("interview_feedback")
    op.drop_table("interview_sessions")
    op.drop_table("interview_questions")
    op.drop_table("interviewer_profiles")

"""0005_skill_bounty_network

Revision ID: 0005_skill_bounty_network
Revises: 0004_unclaimed_talent_radar
Create Date: 2026-10-17 15:00:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0005_skill_bounty_network"
down_revision: Union[str, None] = "0004_unclaimed_talent_radar"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. challenges table
    op.create_table(
        "challenges",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("creator_user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("short_summary", sa.String(length=255), nullable=False),
        sa.Column("problem_statement", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False, server_default="Backend Engineering"),
        sa.Column("required_skills", sa.JSON(), nullable=False),
        sa.Column("difficulty_level", sa.String(length=50), nullable=False, server_default="Intermediate"),
        sa.Column("estimated_effort", sa.String(length=100), nullable=True),
        sa.Column("submission_instructions", sa.Text(), nullable=True),
        sa.Column("evaluation_criteria", sa.JSON(), nullable=False),
        sa.Column("deadline", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="draft"),
        sa.Column("organization_name", sa.String(length=150), nullable=True),
        sa.Column("reward_description", sa.String(length=255), nullable=True),
        sa.Column("mentorship_available", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("opportunity_type_offered", sa.String(length=100), nullable=True),
        sa.Column("opportunity_details", sa.Text(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["creator_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_challenges_id"), "challenges", ["id"], unique=False)
    op.create_index(op.f("ix_challenges_creator_user_id"), "challenges", ["creator_user_id"], unique=False)
    op.create_index(op.f("ix_challenges_title"), "challenges", ["title"], unique=False)
    op.create_index(op.f("ix_challenges_category"), "challenges", ["category"], unique=False)
    op.create_index(op.f("ix_challenges_difficulty_level"), "challenges", ["difficulty_level"], unique=False)
    op.create_index(op.f("ix_challenges_deadline"), "challenges", ["deadline"], unique=False)
    op.create_index(op.f("ix_challenges_status"), "challenges", ["status"], unique=False)
    op.create_index(op.f("ix_challenges_organization_name"), "challenges", ["organization_name"], unique=False)

    # 2. challenge_submissions table
    op.create_table(
        "challenge_submissions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("challenge_id", sa.Integer(), nullable=False),
        sa.Column("student_user_id", sa.Integer(), nullable=False),
        sa.Column("submission_description", sa.Text(), nullable=False),
        sa.Column("repository_url", sa.String(length=500), nullable=False),
        sa.Column("demo_url", sa.String(length=500), nullable=True),
        sa.Column("supporting_evidence_urls", sa.JSON(), nullable=False),
        sa.Column("attachment_references", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="submitted"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["challenge_id"], ["challenges.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_challenge_submissions_id"), "challenge_submissions", ["id"], unique=False)
    op.create_index(op.f("ix_challenge_submissions_challenge_id"), "challenge_submissions", ["challenge_id"], unique=False)
    op.create_index(op.f("ix_challenge_submissions_student_user_id"), "challenge_submissions", ["student_user_id"], unique=False)
    op.create_index(op.f("ix_challenge_submissions_status"), "challenge_submissions", ["status"], unique=False)

    # 3. submission_reviews table
    op.create_table(
        "submission_reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("submission_id", sa.Integer(), nullable=False),
        sa.Column("reviewer_user_id", sa.Integer(), nullable=False),
        sa.Column("technical_feedback", sa.Text(), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("evaluation_criterion_results", sa.JSON(), nullable=False),
        sa.Column("strengths", sa.JSON(), nullable=False),
        sa.Column("areas_for_improvement", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="completed"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["submission_id"], ["challenge_submissions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewer_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_submission_reviews_id"), "submission_reviews", ["id"], unique=False)
    op.create_index(op.f("ix_submission_reviews_submission_id"), "submission_reviews", ["submission_id"], unique=False)
    op.create_index(op.f("ix_submission_reviews_reviewer_user_id"), "submission_reviews", ["reviewer_user_id"], unique=False)

    # 4. challenge_outcomes table
    op.create_table(
        "challenge_outcomes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("challenge_id", sa.Integer(), nullable=False),
        sa.Column("submission_id", sa.Integer(), nullable=False),
        sa.Column("student_user_id", sa.Integer(), nullable=False),
        sa.Column("granted_by_user_id", sa.Integer(), nullable=False),
        sa.Column("outcome_type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("skills_demonstrated", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["challenge_id"], ["challenges.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["submission_id"], ["challenge_submissions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["granted_by_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_challenge_outcomes_id"), "challenge_outcomes", ["id"], unique=False)
    op.create_index(op.f("ix_challenge_outcomes_challenge_id"), "challenge_outcomes", ["challenge_id"], unique=False)
    op.create_index(op.f("ix_challenge_outcomes_submission_id"), "challenge_outcomes", ["submission_id"], unique=False)
    op.create_index(op.f("ix_challenge_outcomes_student_user_id"), "challenge_outcomes", ["student_user_id"], unique=False)
    op.create_index(op.f("ix_challenge_outcomes_granted_by_user_id"), "challenge_outcomes", ["granted_by_user_id"], unique=False)
    op.create_index(op.f("ix_challenge_outcomes_outcome_type"), "challenge_outcomes", ["outcome_type"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_challenge_outcomes_outcome_type"), table_name="challenge_outcomes")
    op.drop_index(op.f("ix_challenge_outcomes_granted_by_user_id"), table_name="challenge_outcomes")
    op.drop_index(op.f("ix_challenge_outcomes_student_user_id"), table_name="challenge_outcomes")
    op.drop_index(op.f("ix_challenge_outcomes_submission_id"), table_name="challenge_outcomes")
    op.drop_index(op.f("ix_challenge_outcomes_challenge_id"), table_name="challenge_outcomes")
    op.drop_index(op.f("ix_challenge_outcomes_id"), table_name="challenge_outcomes")
    op.drop_table("challenge_outcomes")

    op.drop_index(op.f("ix_submission_reviews_reviewer_user_id"), table_name="submission_reviews")
    op.drop_index(op.f("ix_submission_reviews_submission_id"), table_name="submission_reviews")
    op.drop_index(op.f("ix_submission_reviews_id"), table_name="submission_reviews")
    op.drop_table("submission_reviews")

    op.drop_index(op.f("ix_challenge_submissions_status"), table_name="challenge_submissions")
    op.drop_index(op.f("ix_challenge_submissions_student_user_id"), table_name="challenge_submissions")
    op.drop_index(op.f("ix_challenge_submissions_challenge_id"), table_name="challenge_submissions")
    op.drop_index(op.f("ix_challenge_submissions_id"), table_name="challenge_submissions")
    op.drop_table("challenge_submissions")

    op.drop_index(op.f("ix_challenges_organization_name"), table_name="challenges")
    op.drop_index(op.f("ix_challenges_status"), table_name="challenges")
    op.drop_index(op.f("ix_challenges_deadline"), table_name="challenges")
    op.drop_index(op.f("ix_challenges_difficulty_level"), table_name="challenges")
    op.drop_index(op.f("ix_challenges_category"), table_name="challenges")
    op.drop_index(op.f("ix_challenges_title"), table_name="challenges")
    op.drop_index(op.f("ix_challenges_creator_user_id"), table_name="challenges")
    op.drop_index(op.f("ix_challenges_id"), table_name="challenges")
    op.drop_table("challenges")

"""0001_initial_schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-17 12:00:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # 2. profiles table
    op.create_table(
        "profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=150), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="Student"),
        sa.Column("headline", sa.String(length=255), nullable=True),
        sa.Column("biography", sa.Text(), nullable=True),
        sa.Column("skills", sa.JSON(), nullable=False),
        sa.Column("education", sa.JSON(), nullable=True),
        sa.Column("industry", sa.String(length=100), nullable=True),
        sa.Column("current_organization", sa.String(length=150), nullable=True),
        sa.Column("years_of_experience", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("visibility", sa.String(length=30), nullable=False, server_default="public"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id")
    )
    op.create_index(op.f("ix_profiles_id"), "profiles", ["id"], unique=False)
    op.create_index(op.f("ix_profiles_user_id"), "profiles", ["user_id"], unique=True)
    op.create_index(op.f("ix_profiles_industry"), "profiles", ["industry"], unique=False)

    # 3. career_journeys table
    op.create_table(
        "career_journeys",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("job_title", sa.String(length=150), nullable=False),
        sa.Column("company", sa.String(length=150), nullable=False),
        sa.Column("industry", sa.String(length=100), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("is_current", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("skills_used", sa.JSON(), nullable=False),
        sa.Column("projects_or_achievements", sa.JSON(), nullable=False),
        sa.Column("career_transition_notes", sa.Text(), nullable=True),
        sa.Column("visibility", sa.String(length=30), nullable=False, server_default="public"),
        sa.Column("verification_status", sa.String(length=30), nullable=False, server_default="unverified"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_career_journeys_id"), "career_journeys", ["id"], unique=False)
    op.create_index(op.f("ix_career_journeys_user_id"), "career_journeys", ["user_id"], unique=False)
    op.create_index(op.f("ix_career_journeys_job_title"), "career_journeys", ["job_title"], unique=False)
    op.create_index(op.f("ix_career_journeys_industry"), "career_journeys", ["industry"], unique=False)
    op.create_index(op.f("ix_career_journeys_visibility"), "career_journeys", ["visibility"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_career_journeys_visibility"), table_name="career_journeys")
    op.drop_index(op.f("ix_career_journeys_industry"), table_name="career_journeys")
    op.drop_index(op.f("ix_career_journeys_job_title"), table_name="career_journeys")
    op.drop_index(op.f("ix_career_journeys_user_id"), table_name="career_journeys")
    op.drop_index(op.f("ix_career_journeys_id"), table_name="career_journeys")
    op.drop_table("career_journeys")

    op.drop_index(op.f("ix_profiles_industry"), table_name="profiles")
    op.drop_index(op.f("ix_profiles_user_id"), table_name="profiles")
    op.drop_index(op.f("ix_profiles_id"), table_name="profiles")
    op.drop_table("profiles")

    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")

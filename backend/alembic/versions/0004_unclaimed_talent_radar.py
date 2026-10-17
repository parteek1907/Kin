"""0004_unclaimed_talent_radar

Revision ID: 0004_unclaimed_talent_radar
Revises: 0003_social_networking
Create Date: 2026-10-17 14:00:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0004_unclaimed_talent_radar"
down_revision: Union[str, None] = "0003_social_networking"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. opportunities table
    op.create_table(
        "opportunities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("organization", sa.String(length=150), nullable=False),
        sa.Column("opportunity_type", sa.String(length=50), nullable=False, server_default="job"),
        sa.Column("industry", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("required_skills", sa.JSON(), nullable=False),
        sa.Column("preferred_skills", sa.JSON(), nullable=False),
        sa.Column("experience_level", sa.String(length=50), nullable=False, server_default="All"),
        sa.Column("min_years_experience", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("location", sa.String(length=150), nullable=True),
        sa.Column("workplace_type", sa.String(length=50), nullable=False, server_default="remote"),
        sa.Column("eligibility_criteria", sa.JSON(), nullable=False),
        sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="open"),
        sa.Column("visibility", sa.String(length=30), nullable=False, server_default="public"),
        sa.Column("learning_resources", sa.JSON(), nullable=False),
        sa.Column("created_by_user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_opportunities_id"), "opportunities", ["id"], unique=False)
    op.create_index(op.f("ix_opportunities_title"), "opportunities", ["title"], unique=False)
    op.create_index(op.f("ix_opportunities_organization"), "opportunities", ["organization"], unique=False)
    op.create_index(op.f("ix_opportunities_opportunity_type"), "opportunities", ["opportunity_type"], unique=False)
    op.create_index(op.f("ix_opportunities_industry"), "opportunities", ["industry"], unique=False)
    op.create_index(op.f("ix_opportunities_deadline"), "opportunities", ["deadline"], unique=False)
    op.create_index(op.f("ix_opportunities_status"), "opportunities", ["status"], unique=False)
    op.create_index(op.f("ix_opportunities_visibility"), "opportunities", ["visibility"], unique=False)
    op.create_index(op.f("ix_opportunities_created_by_user_id"), "opportunities", ["created_by_user_id"], unique=False)

    # 2. talent_radar_feedback table
    op.create_table(
        "talent_radar_feedback",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("opportunity_id", sa.Integer(), nullable=False),
        sa.Column("feedback_type", sa.String(length=50), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["opportunity_id"], ["opportunities.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "opportunity_id", name="uq_user_opportunity_feedback"),
    )
    op.create_index(op.f("ix_talent_radar_feedback_id"), "talent_radar_feedback", ["id"], unique=False)
    op.create_index(op.f("ix_talent_radar_feedback_user_id"), "talent_radar_feedback", ["user_id"], unique=False)
    op.create_index(op.f("ix_talent_radar_feedback_opportunity_id"), "talent_radar_feedback", ["opportunity_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_talent_radar_feedback_opportunity_id"), table_name="talent_radar_feedback")
    op.drop_index(op.f("ix_talent_radar_feedback_user_id"), table_name="talent_radar_feedback")
    op.drop_index(op.f("ix_talent_radar_feedback_id"), table_name="talent_radar_feedback")
    op.drop_table("talent_radar_feedback")

    op.drop_index(op.f("ix_opportunities_created_by_user_id"), table_name="opportunities")
    op.drop_index(op.f("ix_opportunities_visibility"), table_name="opportunities")
    op.drop_index(op.f("ix_opportunities_status"), table_name="opportunities")
    op.drop_index(op.f("ix_opportunities_deadline"), table_name="opportunities")
    op.drop_index(op.f("ix_opportunities_industry"), table_name="opportunities")
    op.drop_index(op.f("ix_opportunities_opportunity_type"), table_name="opportunities")
    op.drop_index(op.f("ix_opportunities_organization"), table_name="opportunities")
    op.drop_index(op.f("ix_opportunities_title"), table_name="opportunities")
    op.drop_index(op.f("ix_opportunities_id"), table_name="opportunities")
    op.drop_table("opportunities")

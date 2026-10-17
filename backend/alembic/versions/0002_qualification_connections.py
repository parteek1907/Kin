"""0002_qualification_connections

Revision ID: 0002_qualification_connections
Revises: 0001_initial_schema
Create Date: 2026-10-17 12:30:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0002_qualification_connections"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. connection_policies table
    op.create_table(
        "connection_policies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("policy_name", sa.String(length=150), nullable=False),
        sa.Column("required_skills", sa.JSON(), nullable=False),
        sa.Column("preferred_skills", sa.JSON(), nullable=False),
        sa.Column("relevant_industries", sa.JSON(), nullable=False),
        sa.Column("min_project_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("min_years_experience", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("qualification_requirements", sa.JSON(), nullable=True),
        sa.Column("auto_accept_enabled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_connection_policies_id"), "connection_policies", ["id"], unique=False)
    op.create_index(op.f("ix_connection_policies_user_id"), "connection_policies", ["user_id"], unique=False)

    # 2. connection_requests table
    op.create_table(
        "connection_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=False),
        sa.Column("policy_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("auto_accepted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("evaluation_summary", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["policy_id"], ["connection_policies.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("sender_id != recipient_id", name="check_sender_not_recipient")
    )
    op.create_index(op.f("ix_connection_requests_id"), "connection_requests", ["id"], unique=False)
    op.create_index(op.f("ix_connection_requests_sender_id"), "connection_requests", ["sender_id"], unique=False)
    op.create_index(op.f("ix_connection_requests_recipient_id"), "connection_requests", ["recipient_id"], unique=False)
    op.create_index(op.f("ix_connection_requests_status"), "connection_requests", ["status"], unique=False)

    # 3. user_connections table
    op.create_table(
        "user_connections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id_1", sa.Integer(), nullable=False),
        sa.Column("user_id_2", sa.Integer(), nullable=False),
        sa.Column("policy_id", sa.Integer(), nullable=True),
        sa.Column("established_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["policy_id"], ["connection_policies.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id_1"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id_2"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("user_id_1 < user_id_2", name="check_user_order"),
        sa.UniqueConstraint("user_id_1", "user_id_2", name="uq_user_connections_pair")
    )
    op.create_index(op.f("ix_user_connections_id"), "user_connections", ["id"], unique=False)
    op.create_index(op.f("ix_user_connections_user_id_1"), "user_connections", ["user_id_1"], unique=False)
    op.create_index(op.f("ix_user_connections_user_id_2"), "user_connections", ["user_id_2"], unique=False)

    # 4. policy_evaluation_logs table
    op.create_table(
        "policy_evaluation_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("policy_id", sa.Integer(), nullable=True),
        sa.Column("evaluator_user_id", sa.Integer(), nullable=False),
        sa.Column("candidate_user_id", sa.Integer(), nullable=False),
        sa.Column("eligibility_status", sa.String(length=50), nullable=False),
        sa.Column("auto_accept_eligible", sa.Boolean(), nullable=False),
        sa.Column("manual_review_required", sa.Boolean(), nullable=False),
        sa.Column("match_score", sa.Float(), nullable=False),
        sa.Column("criteria_satisfied", sa.JSON(), nullable=False),
        sa.Column("criteria_not_satisfied", sa.JSON(), nullable=False),
        sa.Column("missing_information", sa.JSON(), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["candidate_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["evaluator_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["policy_id"], ["connection_policies.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_policy_evaluation_logs_id"), "policy_evaluation_logs", ["id"], unique=False)
    op.create_index(op.f("ix_policy_evaluation_logs_policy_id"), "policy_evaluation_logs", ["policy_id"], unique=False)
    op.create_index(op.f("ix_policy_evaluation_logs_evaluator_user_id"), "policy_evaluation_logs", ["evaluator_user_id"], unique=False)
    op.create_index(op.f("ix_policy_evaluation_logs_candidate_user_id"), "policy_evaluation_logs", ["candidate_user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_policy_evaluation_logs_candidate_user_id"), table_name="policy_evaluation_logs")
    op.drop_index(op.f("ix_policy_evaluation_logs_evaluator_user_id"), table_name="policy_evaluation_logs")
    op.drop_index(op.f("ix_policy_evaluation_logs_policy_id"), table_name="policy_evaluation_logs")
    op.drop_index(op.f("ix_policy_evaluation_logs_id"), table_name="policy_evaluation_logs")
    op.drop_table("policy_evaluation_logs")

    op.drop_index(op.f("ix_user_connections_user_id_2"), table_name="user_connections")
    op.drop_index(op.f("ix_user_connections_user_id_1"), table_name="user_connections")
    op.drop_index(op.f("ix_user_connections_id"), table_name="user_connections")
    op.drop_table("user_connections")

    op.drop_index(op.f("ix_connection_requests_status"), table_name="connection_requests")
    op.drop_index(op.f("ix_connection_requests_recipient_id"), table_name="connection_requests")
    op.drop_index(op.f("ix_connection_requests_sender_id"), table_name="connection_requests")
    op.drop_index(op.f("ix_connection_requests_id"), table_name="connection_requests")
    op.drop_table("connection_requests")

    op.drop_index(op.f("ix_connection_policies_user_id"), table_name="connection_policies")
    op.drop_index(op.f("ix_connection_policies_id"), table_name="connection_policies")
    op.drop_table("connection_policies")

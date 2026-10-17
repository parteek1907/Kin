"""0006_kin_reputation_engine

Revision ID: 0006_kin_reputation_engine
Revises: 0005_skill_bounty_network
Create Date: 2026-10-17 18:30:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0006_kin_reputation_engine"
down_revision: Union[str, None] = "0005_skill_bounty_network"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. kin_points_policies
    op.create_table(
        "kin_points_policies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(length=60), nullable=False),
        sa.Column("display_name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("base_points", sa.Integer(), nullable=False),
        sa.Column("daily_cap", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("cooldown_seconds", sa.Integer(), nullable=False, server_default="300"),
        sa.Column("requires_counterparty", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("requires_verification", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("min_quality_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("policy_version", sa.String(length=20), nullable=False, server_default="v1.0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index("ix_kin_points_policies_id", "kin_points_policies", ["id"], unique=False)
    op.create_index("ix_kin_points_policies_event_type", "kin_points_policies", ["event_type"], unique=True)

    # 2. kin_reputation_summaries
    op.create_table(
        "kin_reputation_summaries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("lifetime_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_adjustments", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("current_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("rolling_30d_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("rolling_90d_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tier", sa.String(length=30), nullable=False, server_default="Bronze"),
        sa.Column("verified_contributions_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("category_breakdown", sa.JSON(), nullable=False),
        sa.Column("last_activity_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_kin_reputation_summaries_user_id")
    )
    op.create_index("ix_kin_reputation_summaries_id", "kin_reputation_summaries", ["id"], unique=False)
    op.create_index("ix_kin_reputation_summaries_user_id", "kin_reputation_summaries", ["user_id"], unique=True)

    # 3. kin_ledger_entries
    op.create_table(
        "kin_ledger_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(length=60), nullable=False),
        sa.Column("source_reference", sa.String(length=255), nullable=False),
        sa.Column("idempotency_key", sa.String(length=255), nullable=False),
        sa.Column("points", sa.Integer(), nullable=False),
        sa.Column("policy_version", sa.String(length=20), nullable=False, server_default="v1.0"),
        sa.Column("verification_status", sa.String(length=30), nullable=False, server_default="verified"),
        sa.Column("reversal_of_entry_id", sa.Integer(), nullable=True),
        sa.Column("authorized_by_actor_id", sa.Integer(), nullable=True),
        sa.Column("is_system_generated", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("counterparty_user_id", sa.Integer(), nullable=True),
        sa.Column("metadata_payload", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reversal_of_entry_id"], ["kin_ledger_entries.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["authorized_by_actor_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["counterparty_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("idempotency_key", name="uq_kin_ledger_entries_idempotency_key")
    )
    op.create_index("ix_kin_ledger_entries_id", "kin_ledger_entries", ["id"], unique=False)
    op.create_index("ix_kin_ledger_entries_user_id", "kin_ledger_entries", ["user_id"], unique=False)
    op.create_index("ix_kin_ledger_entries_event_type", "kin_ledger_entries", ["event_type"], unique=False)
    op.create_index("ix_kin_ledger_entries_source_reference", "kin_ledger_entries", ["source_reference"], unique=False)
    op.create_index("ix_kin_ledger_entries_idempotency_key", "kin_ledger_entries", ["idempotency_key"], unique=True)
    op.create_index("ix_kin_ledger_entries_reversal_of_entry_id", "kin_ledger_entries", ["reversal_of_entry_id"], unique=False)
    op.create_index("ix_kin_ledger_entries_counterparty_user_id", "kin_ledger_entries", ["counterparty_user_id"], unique=False)

    # 4. kin_abuse_audit_logs
    op.create_table(
        "kin_abuse_audit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("counterparty_user_id", sa.Integer(), nullable=True),
        sa.Column("event_type", sa.String(length=60), nullable=False),
        sa.Column("flag_reason", sa.String(length=150), nullable=False),
        sa.Column("severity", sa.String(length=30), nullable=False, server_default="warning"),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("resolved", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["counterparty_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index("ix_kin_abuse_audit_logs_id", "kin_abuse_audit_logs", ["id"], unique=False)
    op.create_index("ix_kin_abuse_audit_logs_user_id", "kin_abuse_audit_logs", ["user_id"], unique=False)
    op.create_index("ix_kin_abuse_audit_logs_counterparty_user_id", "kin_abuse_audit_logs", ["counterparty_user_id"], unique=False)
    op.create_index("ix_kin_abuse_audit_logs_event_type", "kin_abuse_audit_logs", ["event_type"], unique=False)


def downgrade() -> None:
    op.drop_table("kin_abuse_audit_logs")
    op.drop_table("kin_ledger_entries")
    op.drop_table("kin_reputation_summaries")
    op.drop_table("kin_points_policies")

"""0007_kin_ghost_mode

Revision ID: 0007_kin_ghost_mode
Revises: 0006_kin_reputation_engine
Create Date: 2026-10-17 18:55:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0007_kin_ghost_mode"
down_revision: Union[str, None] = "0006_kin_reputation_engine"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. ghost_entitlements
    op.create_table(
        "ghost_entitlements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("plan_type", sa.String(length=50), nullable=False, server_default="ghost_monthly"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="active"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("auto_renew", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("payment_reference", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_ghost_entitlements_user_id")
    )
    op.create_index("ix_ghost_entitlements_id", "ghost_entitlements", ["id"], unique=False)
    op.create_index("ix_ghost_entitlements_user_id", "ghost_entitlements", ["user_id"], unique=True)

    # 2. ghost_personas
    op.create_table(
        "ghost_personas",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("persona_handle", sa.String(length=64), nullable=False),
        sa.Column("pseudonym", sa.String(length=100), nullable=False),
        sa.Column("avatar_seed", sa.String(length=50), nullable=False),
        sa.Column("theme_color", sa.String(length=30), nullable=False, server_default="indigo"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("persona_handle", name="uq_ghost_personas_persona_handle")
    )
    op.create_index("ix_ghost_personas_id", "ghost_personas", ["id"], unique=False)
    op.create_index("ix_ghost_personas_persona_handle", "ghost_personas", ["persona_handle"], unique=True)

    # 3. ghost_identity_mappings
    op.create_table(
        "ghost_identity_mappings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("persona_id", sa.Integer(), nullable=False),
        sa.Column("is_current", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["persona_id"], ["ghost_personas.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("persona_id", name="uq_ghost_identity_mappings_persona_id")
    )
    op.create_index("ix_ghost_identity_mappings_id", "ghost_identity_mappings", ["id"], unique=False)
    op.create_index("ix_ghost_identity_mappings_user_id", "ghost_identity_mappings", ["user_id"], unique=False)
    op.create_index("ix_ghost_identity_mappings_persona_id", "ghost_identity_mappings", ["persona_id"], unique=True)

    # 4. ghost_posts
    op.create_table(
        "ghost_posts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("persona_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False, server_default="general_anonymous"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="published"),
        sa.Column("view_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reply_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reaction_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["persona_id"], ["ghost_personas.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index("ix_ghost_posts_id", "ghost_posts", ["id"], unique=False)
    op.create_index("ix_ghost_posts_persona_id", "ghost_posts", ["persona_id"], unique=False)
    op.create_index("ix_ghost_posts_category", "ghost_posts", ["category"], unique=False)
    op.create_index("ix_ghost_posts_status", "ghost_posts", ["status"], unique=False)

    # 5. ghost_replies
    op.create_table(
        "ghost_replies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("persona_id", sa.Integer(), nullable=False),
        sa.Column("parent_reply_id", sa.Integer(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="published"),
        sa.Column("reaction_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["post_id"], ["ghost_posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["persona_id"], ["ghost_personas.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_reply_id"], ["ghost_replies.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index("ix_ghost_replies_id", "ghost_replies", ["id"], unique=False)
    op.create_index("ix_ghost_replies_post_id", "ghost_replies", ["post_id"], unique=False)
    op.create_index("ix_ghost_replies_persona_id", "ghost_replies", ["persona_id"], unique=False)

    # 6. ghost_reactions
    op.create_table(
        "ghost_reactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("target_type", sa.String(length=20), nullable=False),
        sa.Column("target_id", sa.Integer(), nullable=False),
        sa.Column("persona_id", sa.Integer(), nullable=False),
        sa.Column("reaction_type", sa.String(length=30), nullable=False, server_default="helpful"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["persona_id"], ["ghost_personas.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("target_type", "target_id", "persona_id", "reaction_type", name="uq_ghost_reaction_target_persona")
    )
    op.create_index("ix_ghost_reactions_id", "ghost_reactions", ["id"], unique=False)
    op.create_index("ix_ghost_reactions_target_type", "ghost_reactions", ["target_type"], unique=False)
    op.create_index("ix_ghost_reactions_target_id", "ghost_reactions", ["target_id"], unique=False)
    op.create_index("ix_ghost_reactions_persona_id", "ghost_reactions", ["persona_id"], unique=False)

    # 7. ghost_reports
    op.create_table(
        "ghost_reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("target_type", sa.String(length=20), nullable=False),
        sa.Column("target_id", sa.Integer(), nullable=False),
        sa.Column("reporter_persona_id", sa.Integer(), nullable=True),
        sa.Column("reason_category", sa.String(length=50), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("moderator_notes", sa.Text(), nullable=True),
        sa.Column("reviewed_by_user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["reporter_persona_id"], ["ghost_personas.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["reviewed_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index("ix_ghost_reports_id", "ghost_reports", ["id"], unique=False)
    op.create_index("ix_ghost_reports_status", "ghost_reports", ["status"], unique=False)

    # 8. ghost_persona_mutes
    op.create_table(
        "ghost_persona_mutes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("muter_persona_id", sa.Integer(), nullable=False),
        sa.Column("muted_persona_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["muter_persona_id"], ["ghost_personas.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["muted_persona_id"], ["ghost_personas.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("muter_persona_id", "muted_persona_id", name="uq_ghost_persona_mute_pair")
    )
    op.create_index("ix_ghost_persona_mutes_id", "ghost_persona_mutes", ["id"], unique=False)
    op.create_index("ix_ghost_persona_mutes_muter_persona_id", "ghost_persona_mutes", ["muter_persona_id"], unique=False)
    op.create_index("ix_ghost_persona_mutes_muted_persona_id", "ghost_persona_mutes", ["muted_persona_id"], unique=False)

    # 9. ghost_audit_logs
    op.create_table(
        "ghost_audit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("moderator_user_id", sa.Integer(), nullable=False),
        sa.Column("target_persona_id", sa.Integer(), nullable=False),
        sa.Column("resolved_user_id", sa.Integer(), nullable=False),
        sa.Column("audit_reason", sa.Text(), nullable=False),
        sa.Column("action_type", sa.String(length=50), nullable=False, server_default="identity_reveal_investigation"),
        sa.Column("incident_ticket", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["moderator_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["target_persona_id"], ["ghost_personas.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resolved_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index("ix_ghost_audit_logs_id", "ghost_audit_logs", ["id"], unique=False)
    op.create_index("ix_ghost_audit_logs_moderator_user_id", "ghost_audit_logs", ["moderator_user_id"], unique=False)
    op.create_index("ix_ghost_audit_logs_target_persona_id", "ghost_audit_logs", ["target_persona_id"], unique=False)
    op.create_index("ix_ghost_audit_logs_resolved_user_id", "ghost_audit_logs", ["resolved_user_id"], unique=False)


def downgrade() -> None:
    op.drop_table("ghost_audit_logs")
    op.drop_table("ghost_persona_mutes")
    op.drop_table("ghost_reports")
    op.drop_table("ghost_reactions")
    op.drop_table("ghost_replies")
    op.drop_table("ghost_posts")
    op.drop_table("ghost_identity_mappings")
    op.drop_table("ghost_personas")
    op.drop_table("ghost_entitlements")

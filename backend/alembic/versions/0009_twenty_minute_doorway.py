"""0009_twenty_minute_doorway

Revision ID: 0009_twenty_minute_doorway
Revises: 0008_mock_interviews
Create Date: 2026-10-17 19:30:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0009_twenty_minute_doorway"
down_revision: Union[str, None] = "0008_mock_interviews"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. doorway_expert_profiles
    op.create_table(
        "doorway_expert_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("institution_affiliation", sa.String(length=150), nullable=False),
        sa.Column("headline", sa.String(length=255), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("current_organization", sa.String(length=150), nullable=True),
        sa.Column("current_role", sa.String(length=150), nullable=True),
        sa.Column("years_of_experience", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("expertise_categories", sa.JSON(), nullable=False),
        sa.Column("supported_consultation_types", sa.JSON(), nullable=False),
        sa.Column("evidence_links", sa.JSON(), nullable=False),
        sa.Column("verification_notes", sa.Text(), nullable=True),
        sa.Column("verification_status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verified_by_user_id", sa.Integer(), nullable=True),
        sa.Column("reverification_due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("availability_slots", sa.JSON(), nullable=False),
        sa.Column("completed_sessions_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_reviews_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("average_rating", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("response_rate_percent", sa.Float(), nullable=False, server_default="100.0"),
        sa.Column("ai_slop_complaints_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("payout_account_details", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["verified_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("user_id", name="uq_doorway_expert_user_id")
    )
    op.create_index("ix_doorway_expert_profiles_id", "doorway_expert_profiles", ["id"])
    op.create_index("ix_doorway_expert_profiles_user_id", "doorway_expert_profiles", ["user_id"])
    op.create_index("ix_doorway_expert_profiles_verification_status", "doorway_expert_profiles", ["verification_status"])
    op.create_index("ix_doorway_expert_profiles_is_active", "doorway_expert_profiles", ["is_active"])

    # 2. doorway_listings
    op.create_table(
        "doorway_listings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("expert_profile_id", sa.Integer(), nullable=False),
        sa.Column("expert_user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("service_scope", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("expected_deliverables", sa.JSON(), nullable=False),
        sa.Column("session_duration_minutes", sa.Integer(), nullable=False, server_default="20"),
        sa.Column("price_amount_minor", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("pricing_policy_version", sa.String(length=20), nullable=False, server_default="v1_split_50_50"),
        sa.Column("availability_slots", sa.JSON(), nullable=False),
        sa.Column("booking_constraints", sa.JSON(), nullable=False),
        sa.Column("cancellation_policy", sa.Text(), nullable=True),
        sa.Column("preparation_requirements", sa.Text(), nullable=True),
        sa.Column("service_limitations", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["expert_profile_id"], ["doorway_expert_profiles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["expert_user_id"], ["users.id"], ondelete="CASCADE")
    )
    op.create_index("ix_doorway_listings_id", "doorway_listings", ["id"])
    op.create_index("ix_doorway_listings_expert_profile_id", "doorway_listings", ["expert_profile_id"])
    op.create_index("ix_doorway_listings_expert_user_id", "doorway_listings", ["expert_user_id"])
    op.create_index("ix_doorway_listings_category", "doorway_listings", ["category"])
    op.create_index("ix_doorway_listings_is_active", "doorway_listings", ["is_active"])

    # 3. doorway_bookings
    op.create_table(
        "doorway_bookings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("booking_reference", sa.String(length=50), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("expert_user_id", sa.Integer(), nullable=False),
        sa.Column("listing_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="created"),
        sa.Column("scheduled_start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("scheduled_end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False, server_default="20"),
        sa.Column("student_notes", sa.Text(), nullable=True),
        sa.Column("preparation_submitted", sa.JSON(), nullable=False),
        sa.Column("ai_assistance_used", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("ai_assistance_summary", sa.Text(), nullable=True),
        sa.Column("recording_consent", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("recording_url", sa.String(length=255), nullable=True),
        sa.Column("gross_amount_minor", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("pricing_policy_version", sa.String(length=20), nullable=False, server_default="v1_split_50_50"),
        sa.Column("student_completed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("student_completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expert_completed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("expert_completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("no_show_reported_by", sa.String(length=30), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("cancelled_by_user_id", sa.Integer(), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["expert_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["listing_id"], ["doorway_listings.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("booking_reference", name="uq_doorway_booking_reference")
    )
    op.create_index("ix_doorway_bookings_id", "doorway_bookings", ["id"])
    op.create_index("ix_doorway_bookings_booking_reference", "doorway_bookings", ["booking_reference"])
    op.create_index("ix_doorway_bookings_student_id", "doorway_bookings", ["student_id"])
    op.create_index("ix_doorway_bookings_expert_user_id", "doorway_bookings", ["expert_user_id"])
    op.create_index("ix_doorway_bookings_listing_id", "doorway_bookings", ["listing_id"])
    op.create_index("ix_doorway_bookings_status", "doorway_bookings", ["status"])
    op.create_index("ix_doorway_bookings_scheduled_start_time", "doorway_bookings", ["scheduled_start_time"])

    # 4. doorway_payment_orders
    op.create_table(
        "doorway_payment_orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("payment_intent_reference", sa.String(length=64), nullable=False),
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("provider_name", sa.String(length=50), nullable=False, server_default="mock_gateway"),
        sa.Column("provider_order_id", sa.String(length=100), nullable=False),
        sa.Column("provider_payment_id", sa.String(length=100), nullable=True),
        sa.Column("amount_minor", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("client_secret", sa.String(length=128), nullable=False),
        sa.Column("idempotency_key", sa.String(length=100), nullable=False),
        sa.Column("webhook_last_event_id", sa.String(length=100), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["booking_id"], ["doorway_bookings.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("payment_intent_reference", name="uq_doorway_payment_intent_ref"),
        sa.UniqueConstraint("booking_id", name="uq_doorway_payment_booking_id"),
        sa.UniqueConstraint("idempotency_key", name="uq_doorway_payment_idempotency_key")
    )
    op.create_index("ix_doorway_payment_orders_id", "doorway_payment_orders", ["id"])
    op.create_index("ix_doorway_payment_orders_provider_order_id", "doorway_payment_orders", ["provider_order_id"])
    op.create_index("ix_doorway_payment_orders_provider_payment_id", "doorway_payment_orders", ["provider_payment_id"])
    op.create_index("ix_doorway_payment_orders_status", "doorway_payment_orders", ["status"])

    # 5. doorway_financial_ledger
    op.create_table(
        "doorway_financial_ledger",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("entry_reference", sa.String(length=64), nullable=False),
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("gross_amount_minor", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("eligible_commission_base_minor", sa.Integer(), nullable=False),
        sa.Column("platform_share_minor", sa.Integer(), nullable=False),
        sa.Column("alumni_share_minor", sa.Integer(), nullable=False),
        sa.Column("taxes_minor", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("processing_fees_minor", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("refund_amount_minor", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("adjustment_amount_minor", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("entry_type", sa.String(length=40), nullable=False, server_default="initial_allocation"),
        sa.Column("pricing_policy_version", sa.String(length=20), nullable=False, server_default="v1_split_50_50"),
        sa.Column("settlement_status", sa.String(length=30), nullable=False, server_default="unsettled"),
        sa.Column("payout_reference", sa.String(length=64), nullable=True),
        sa.Column("reconciliation_status", sa.String(length=30), nullable=False, server_default="matched"),
        sa.Column("reversal_of_entry_id", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("immutable_audit_hash", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["booking_id"], ["doorway_bookings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reversal_of_entry_id"], ["doorway_financial_ledger.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("entry_reference", name="uq_doorway_ledger_entry_ref")
    )
    op.create_index("ix_doorway_financial_ledger_id", "doorway_financial_ledger", ["id"])
    op.create_index("ix_doorway_financial_ledger_booking_id", "doorway_financial_ledger", ["booking_id"])
    op.create_index("ix_doorway_financial_ledger_entry_type", "doorway_financial_ledger", ["entry_type"])
    op.create_index("ix_doorway_financial_ledger_settlement_status", "doorway_financial_ledger", ["settlement_status"])
    op.create_index("ix_doorway_financial_ledger_payout_reference", "doorway_financial_ledger", ["payout_reference"])

    # 6. doorway_alumni_payouts
    op.create_table(
        "doorway_alumni_payouts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("payout_reference", sa.String(length=64), nullable=False),
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("expert_user_id", sa.Integer(), nullable=False),
        sa.Column("amount_minor", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("payout_status", sa.String(length=30), nullable=False, server_default="scheduled"),
        sa.Column("provider_transfer_id", sa.String(length=100), nullable=True),
        sa.Column("destination_account_mask", sa.String(length=50), nullable=False),
        sa.Column("failure_reason", sa.Text(), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("idempotency_key", sa.String(length=100), nullable=False),
        sa.Column("authorized_by_admin_id", sa.Integer(), nullable=True),
        sa.Column("executed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["booking_id"], ["doorway_bookings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["expert_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["authorized_by_admin_id"], ["users.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("payout_reference", name="uq_doorway_payout_ref"),
        sa.UniqueConstraint("booking_id", name="uq_doorway_payout_booking_id"),
        sa.UniqueConstraint("idempotency_key", name="uq_doorway_payout_idempotency_key")
    )
    op.create_index("ix_doorway_alumni_payouts_id", "doorway_alumni_payouts", ["id"])
    op.create_index("ix_doorway_alumni_payouts_expert_user_id", "doorway_alumni_payouts", ["expert_user_id"])
    op.create_index("ix_doorway_alumni_payouts_payout_status", "doorway_alumni_payouts", ["payout_status"])

    # 7. doorway_reviews
    op.create_table(
        "doorway_reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("expert_user_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("review_text", sa.Text(), nullable=False),
        sa.Column("usefulness_score", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("human_expertise_verified", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("ai_slop_complaint", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("would_recommend", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["booking_id"], ["doorway_bookings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["expert_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("booking_id", name="uq_doorway_review_booking_id")
    )
    op.create_index("ix_doorway_reviews_id", "doorway_reviews", ["id"])
    op.create_index("ix_doorway_reviews_student_id", "doorway_reviews", ["student_id"])
    op.create_index("ix_doorway_reviews_expert_user_id", "doorway_reviews", ["expert_user_id"])

    # 8. doorway_disputes
    op.create_table(
        "doorway_disputes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("dispute_reference", sa.String(length=64), nullable=False),
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("opened_by_user_id", sa.Integer(), nullable=False),
        sa.Column("dispute_reason", sa.String(length=50), nullable=False),
        sa.Column("detailed_explanation", sa.Text(), nullable=False),
        sa.Column("requested_resolution", sa.String(length=50), nullable=False, server_default="full_refund"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="open"),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("refund_amount_minor", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("resolved_by_admin_id", sa.Integer(), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["booking_id"], ["doorway_bookings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["opened_by_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resolved_by_admin_id"], ["users.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("dispute_reference", name="uq_doorway_dispute_ref")
    )
    op.create_index("ix_doorway_disputes_id", "doorway_disputes", ["id"])
    op.create_index("ix_doorway_disputes_booking_id", "doorway_disputes", ["booking_id"])
    op.create_index("ix_doorway_disputes_opened_by_user_id", "doorway_disputes", ["opened_by_user_id"])
    op.create_index("ix_doorway_disputes_status", "doorway_disputes", ["status"])

    # 9. doorway_audit_logs
    op.create_table(
        "doorway_audit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("entity_type", sa.String(length=50), nullable=False),
        sa.Column("entity_id", sa.String(length=100), nullable=False),
        sa.Column("action", sa.String(length=50), nullable=False),
        sa.Column("actor_user_id", sa.Integer(), nullable=True),
        sa.Column("actor_role", sa.String(length=50), nullable=True),
        sa.Column("previous_state", sa.JSON(), nullable=True),
        sa.Column("new_state", sa.JSON(), nullable=True),
        sa.Column("metadata_payload", sa.JSON(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index("ix_doorway_audit_logs_id", "doorway_audit_logs", ["id"])
    op.create_index("ix_doorway_audit_logs_entity_type", "doorway_audit_logs", ["entity_type"])
    op.create_index("ix_doorway_audit_logs_entity_id", "doorway_audit_logs", ["entity_id"])
    op.create_index("ix_doorway_audit_logs_action", "doorway_audit_logs", ["action"])
    op.create_index("ix_doorway_audit_logs_actor_user_id", "doorway_audit_logs", ["actor_user_id"])
    op.create_index("ix_doorway_audit_logs_timestamp", "doorway_audit_logs", ["timestamp"])


def downgrade() -> None:
    op.drop_table("doorway_audit_logs")
    op.drop_table("doorway_disputes")
    op.drop_table("doorway_reviews")
    op.drop_table("doorway_alumni_payouts")
    op.drop_table("doorway_financial_ledger")
    op.drop_table("doorway_payment_orders")
    op.drop_table("doorway_bookings")
    op.drop_table("doorway_listings")
    op.drop_table("doorway_expert_profiles")

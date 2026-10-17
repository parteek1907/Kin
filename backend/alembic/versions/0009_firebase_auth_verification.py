"""0009_firebase_auth_verification

Revision ID: 0009_firebase_auth_verification
Revises: 0008_mock_interviews
Create Date: 2026-10-17 19:20:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0009_firebase_auth_verification"
down_revision: Union[str, None] = "0008_mock_interviews"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add firebase_uid to users table
    op.add_column("users", sa.Column("firebase_uid", sa.String(length=128), nullable=True))
    op.create_index(op.f("ix_users_firebase_uid"), "users", ["firebase_uid"], unique=True)

    # Add verification fields to profiles table
    op.add_column("profiles", sa.Column("student_id", sa.String(length=100), nullable=True))
    op.add_column("profiles", sa.Column("business_id", sa.String(length=100), nullable=True))
    op.add_column("profiles", sa.Column("verification_status", sa.String(length=50), server_default="unverified", nullable=False))
    op.create_index(op.f("ix_profiles_student_id"), "profiles", ["student_id"], unique=False)
    op.create_index(op.f("ix_profiles_business_id"), "profiles", ["business_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_profiles_business_id"), table_name="profiles")
    op.drop_index(op.f("ix_profiles_student_id"), table_name="profiles")
    op.drop_column("profiles", "verification_status")
    op.drop_column("profiles", "business_id")
    op.drop_column("profiles", "student_id")

    op.drop_index(op.f("ix_users_firebase_uid"), table_name="users")
    op.drop_column("users", "firebase_uid")

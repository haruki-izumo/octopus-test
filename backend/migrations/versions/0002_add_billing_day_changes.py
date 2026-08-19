"""Add billing day changes

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-24 10:20:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | Sequence[str] | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'BILLING_DAY_CHANGED'")
    op.create_table(
        "billing_day_changes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("uuid", sa.Uuid(), nullable=False, unique=True),
        sa.Column(
            "contract_id",
            sa.Integer(),
            sa.ForeignKey("contracts.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("previous_billing_day", sa.Integer(), nullable=False),
        sa.Column("new_billing_day", sa.Integer(), nullable=False),
        sa.Column("effective_from", sa.Date(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )


def downgrade() -> None:
    op.drop_table("billing_day_changes")
    # Postgres can't remove a value from an enum type, so BILLING_DAY_CHANGED stays.

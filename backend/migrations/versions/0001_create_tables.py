"""Create contracts, audit, outbox and idempotency tables

Revision ID: 0001
Revises:
Create Date: 2026-09-24 09:47:34.049716

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _timestamps() -> list[sa.Column]:
    return [
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    ]


def upgrade() -> None:
    op.create_table(
        "contracts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("uuid", sa.Uuid(), nullable=False, unique=True),
        sa.Column("customer_uuid", sa.Uuid(), nullable=False),
        sa.Column("vehicle_make", sa.String(), nullable=False),
        sa.Column("vehicle_model", sa.String(), nullable=False),
        sa.Column("vehicle_registration", sa.String(), nullable=False),
        sa.Column("vehicle_price", sa.BigInteger(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("ACTIVE", "PENDING_VARIATION", "TERMINATED", name="contract_status"),
            nullable=False,
        ),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("term_months", sa.Integer(), nullable=False),
        sa.Column("annual_mileage", sa.Integer(), nullable=False),
        sa.Column("residual_value", sa.BigInteger(), nullable=False),
        sa.Column("monthly_payment", sa.BigInteger(), nullable=False),
        sa.Column("billing_day", sa.Integer(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        *_timestamps(),
        sa.CheckConstraint("billing_day BETWEEN 1 AND 28", name="billing_day"),
    )
    op.create_table(
        "audit_entries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("uuid", sa.Uuid(), nullable=False, unique=True),
        sa.Column(
            "contract_id",
            sa.Integer(),
            sa.ForeignKey("contracts.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("action", sa.Enum("CONTRACT_CREATED", name="audit_action"), nullable=False),
        sa.Column("before", postgresql.JSONB(), nullable=True),
        sa.Column("after", postgresql.JSONB(), nullable=False),
        sa.Column("actor", sa.String(), nullable=False),
        *_timestamps(),
    )
    op.create_table(
        "outbox_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        *_timestamps(),
    )
    op.create_index(
        "ix_outbox_messages_unsent",
        "outbox_messages",
        ["id"],
        postgresql_where=sa.text("sent_at IS NULL"),
    )
    op.create_table(
        "idempotency_keys",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(), nullable=False, unique=True),
        sa.Column("request_hash", sa.String(), nullable=False),
        sa.Column("response_status", sa.Integer(), nullable=True),
        sa.Column("response_body", postgresql.JSONB(), nullable=True),
        *_timestamps(),
    )


def downgrade() -> None:
    op.drop_table("idempotency_keys")
    op.drop_table("outbox_messages")
    op.drop_table("audit_entries")
    op.drop_table("contracts")
    op.execute("DROP TYPE audit_action")
    op.execute("DROP TYPE contract_status")

from datetime import date, datetime, timedelta
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Index, MetaData, func, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from src.common.dates import BusinessDate
from src.common.errors import BusinessRuleError
from src.common.money import MoneyInt, MoneyIntType
from src.enums import AuditAction, ContractStatus

JsonObject = dict[str, Any]


class Base(DeclarativeBase):
    # Predictable constraint names, so later migrations can refer to them.
    metadata = MetaData(
        naming_convention={
            "ix": "ix_%(column_0_label)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s",
        }
    )
    type_annotation_map = {
        datetime: DateTime(timezone=True),
        MoneyInt: MoneyIntType(),
        JsonObject: JSONB,
    }
    # Reads back timestamps set by the database, so they can be used without another query.
    __mapper_args__ = {"eager_defaults": True}

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())


class UuidMixin:
    uuid: Mapped[UUID] = mapped_column(unique=True, default=uuid4)


_ALLOWED_STATUS_CHANGES = {
    (ContractStatus.ACTIVE, ContractStatus.PENDING_VARIATION),
    (ContractStatus.PENDING_VARIATION, ContractStatus.ACTIVE),
    (ContractStatus.ACTIVE, ContractStatus.TERMINATED),
}


class Contract(UuidMixin, Base):
    __tablename__ = "contracts"
    __table_args__ = (CheckConstraint("billing_day BETWEEN 1 AND 28", name="billing_day"),)

    customer_uuid: Mapped[UUID]
    vehicle_make: Mapped[str]
    vehicle_model: Mapped[str]
    vehicle_registration: Mapped[str]
    vehicle_price: Mapped[MoneyInt]
    status: Mapped[ContractStatus] = mapped_column(Enum(ContractStatus, name="contract_status"))
    start_date: Mapped[date]
    term_months: Mapped[int]
    annual_mileage: Mapped[int]
    residual_value: Mapped[MoneyInt]
    monthly_payment: Mapped[MoneyInt]
    billing_day: Mapped[int]
    version: Mapped[int] = mapped_column()

    # SQLAlchemy sets version to 1 on insert. Each update adds 1, and only succeeds if the
    # row still has the version that was loaded.
    __mapper_args__ = {"eager_defaults": True, "version_id_col": version}

    @property
    def end_date(self) -> date:
        return BusinessDate.from_date(self.start_date).add_months(self.term_months) - timedelta(
            days=1
        )

    def months_remaining(self, as_of: date) -> int:
        """Months left in the term, counting a part month as a whole one."""
        if as_of > self.end_date:
            return 0
        start_date = BusinessDate.from_date(self.start_date)
        months_elapsed = (as_of.year - start_date.year) * 12 + as_of.month - start_date.month
        if start_date.add_months(months_elapsed) > as_of:
            months_elapsed -= 1
        return self.term_months - max(months_elapsed, 0)

    def change_status(self, new_status: ContractStatus) -> None:
        if (self.status, new_status) not in _ALLOWED_STATUS_CHANGES:
            raise BusinessRuleError(f"A contract can't change from {self.status} to {new_status}")
        self.status = new_status

    def audit_snapshot(self) -> JsonObject:
        """The contract's terms, as recorded in audit entries."""
        return {
            "customer_uuid": str(self.customer_uuid),
            "status": self.status,
            "vehicle_make": self.vehicle_make,
            "vehicle_model": self.vehicle_model,
            "vehicle_registration": self.vehicle_registration,
            "vehicle_price_pence": self.vehicle_price.pence,
            "start_date": self.start_date.isoformat(),
            "term_months": self.term_months,
            "annual_mileage": self.annual_mileage,
            "residual_value_pence": self.residual_value.pence,
            "monthly_payment_pence": self.monthly_payment.pence,
            "billing_day": self.billing_day,
        }


class BillingDayChange(UuidMixin, Base):
    __tablename__ = "billing_day_changes"

    contract_id: Mapped[int] = mapped_column(ForeignKey("contracts.id"), index=True)
    previous_billing_day: Mapped[int]
    new_billing_day: Mapped[int]
    effective_from: Mapped[date]


class AuditEntry(UuidMixin, Base):
    __tablename__ = "audit_entries"

    contract_id: Mapped[int] = mapped_column(ForeignKey("contracts.id"), index=True)
    action: Mapped[AuditAction] = mapped_column(Enum(AuditAction, name="audit_action"))
    before: Mapped[JsonObject | None]
    after: Mapped[JsonObject]
    actor: Mapped[str]


class OutboxMessage(Base):
    __tablename__ = "outbox_messages"
    __table_args__ = (
        Index("ix_outbox_messages_unsent", "id", postgresql_where=text("sent_at IS NULL")),
    )

    event_type: Mapped[str]
    payload: Mapped[JsonObject]
    sent_at: Mapped[datetime | None]


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"

    key: Mapped[str] = mapped_column(unique=True)
    request_hash: Mapped[str]
    # Both empty while the first request with this key is still being handled.
    response_status: Mapped[int | None]
    response_body: Mapped[JsonObject | None]

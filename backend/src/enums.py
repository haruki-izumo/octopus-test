from enum import StrEnum


class ContractStatus(StrEnum):
    ACTIVE = "ACTIVE"
    # A contract waits in this state until the customer accepts a change.
    PENDING_VARIATION = "PENDING_VARIATION"
    TERMINATED = "TERMINATED"


class AuditAction(StrEnum):
    CONTRACT_CREATED = "CONTRACT_CREATED"

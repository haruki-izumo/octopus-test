# Lease Contract Service

Manages active vehicle leases: creating contracts, changes to contracts
during the lease, and the events other services rely on.

## Context
- About 40,000 active contracts, growing by ~1,500 a month
- Payments are collected daily, on each contract's billing day
- This service is the source of truth for contract terms. The billing
  service holds payment schedules, and the documents service creates and
  sends contract paperwork

## Who uses this service
The **customer portal** and the **agent tool** both read contracts using
`GET /contracts/{uuid}`, so its response must not change in ways that
break them (see rule 8 in `docs/conventions.md`).

## Before you make changes
Read `docs/conventions.md`: how we build things here, and why.

## Running locally
```
just           # choose a command from a list
just up        # start everything (see below)
just migrate   # run database migrations
just tail      # follow the logs from every container
just seed      # add example data
just test      # run the tests
just check     # lint, format check and type check
```

`just up` starts Postgres, the API on http://localhost:8080 and the outbox
relay (the process that sends events to other services). The API and relay
restart by themselves when you change code in `backend/src`. Run
`just migrate` the first time, and whenever a new migration is added.

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
break them (see rule 8 in `backend/docs/conventions.md`).

The customer portal is in `frontend/apps/customer-portal`. It's a Next.js
app that lets customers see their contract and make changes to it, such as
their payment date.

## Before you make changes
Read `backend/docs/conventions.md` and `frontend/docs/conventions.md`: how
we build things here, and why.

## Running locally
You'll need [Docker](https://docs.docker.com/get-docker/),
[uv](https://docs.astral.sh/uv/), [just](https://just.systems/),
[Node.js](https://nodejs.org/) 26 and [pnpm](https://pnpm.io/installation) 11.

```
just install   # install the backend and front-end dependencies
just dev       # start everything, and the customer portal on http://localhost:3000
just seed      # add example data, and print a link to each example contract
```

Other commands:
```
just           # choose a command from a list
just up        # start the backend (see below)
just down      # stop the backend
just migrate   # run database migrations
just tail      # follow the logs from every container
just test      # run the tests (or test-backend / test-frontend)
just check     # lint, format check and type check (or check-backend / check-frontend)
```

`just up` starts Postgres, the API on http://localhost:8080 and the outbox
relay (the process that sends events to other services). The API and relay
restart by themselves when you change code in `backend/src`. Run
`just migrate` the first time, and whenever a new migration is added.

`just dev` does both of those, then runs the customer portal in the
foreground. It reloads when you change its code, and `Ctrl+C` stops it.
The backend keeps running until `just down`. The portal calls the API
through `/api` on its own address, so the browser only talks to the portal.

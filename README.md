**About the task**

The repo contains a smaller, cut-down version of our leasing platform. It includes a GitHub issue describing the requirements for a new feature, and a PR that introduces that feature.

**How to review**

- The PR was written by a colleague working with an AI assistant. Review it as you would any PR from a teammate.
- Add your comments directly on the PR in GitHub, wherever you think they would help your teammate improve their work.
- You're encouraged to use AI to help. **Please include your prompts and transcripts from the AI sessions in your PR comments.**

**When you're done**

Let us know and we'll start our review process.

If anything is unclear, or you have any questions at any point throughout the process, please ask.

---

# Lease Contract Service

Manages active vehicle leases: creating contracts, changes to contracts
during the lease, and the events other services rely on.

## Context
- Payments are collected daily, on each contract's billing day
- This service is the source of truth for contract terms. The billing
  service holds payment schedules, and the documents service creates and
  sends contract paperwork

## Who uses this service
The customer portal is in `frontend/apps/customer-portal`. It's a Next.js
app that lets customers see their contract and make changes to it, such as
their payment date.

The service tool is in `frontend/apps/service-tool`. It's a Next.js app
for our own staff: find a contract by its UUID and see all of its details.

## Before making changes
Read `backend/docs/conventions.md` and `frontend/docs/conventions.md` on
how we build things, and why.

## Running locally
You'll need [Docker](https://docs.docker.com/get-docker/),
[uv](https://docs.astral.sh/uv/), [just](https://just.systems/),
[Node.js](https://nodejs.org/) 26 and [pnpm](https://pnpm.io/installation) 11.

```
just install   # install the backend and front-end dependencies
just dev       # start everything, the customer portal on http://localhost:3000 and the service tool on http://localhost:3001
just seed      # in another terminal: add example data, and print a link to each example contract
```

Other commands:
```
just           # choose a command from a list
just down      # stop the backend
just migrate   # run database migrations
just tail      # follow the logs from the API and relay
just test      # run the tests (or test-backend / test-frontend)
just check     # lint, format check and type check (or check-backend / check-frontend)
```

`just dev` starts the backend in Docker (Postgres, the API on
http://localhost:8080 and the outbox relay) and runs the migrations, then
runs the customer portal and the service tool in the foreground. They reload when you change their code, and
`Ctrl+C` stops them. The backend keeps running until `just down`. The portal
calls the API through `/api` on its own address, so the browser only talks
to the portal.

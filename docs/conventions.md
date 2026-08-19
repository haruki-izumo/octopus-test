# How we build things

These are the rules we follow in the backend. Each one exists because
something went wrong without it. Paths are relative to `backend/`.

## 1. Code is grouped by business area
Each area has its own folder in `src/features/`, containing:
- `routes.py`: the API endpoints
- `controller.py`: the business rules
- `database_client.py`: database queries (if the feature has its own tables)
- `schemas.py`: the shapes of requests and responses

Features don't import from each other. Code needed by more than one
feature lives in `src/common/`.

**Why:** you can understand, change or delete a feature by looking at one
folder.

## 2. Money is always `MoneyInt`
Amounts are stored and calculated as whole pence using `MoneyInt`, from
`src/common/money.py`. Never use floats or plain numbers for money, even
for a step in the middle of a calculation. Multiplying or dividing rounds
to the nearest penny (half up). Amounts are only shown in pounds in API
responses.

**Why:** we used to have penny differences between what customers were
quoted and what billing collected.

## 3. Get the date from the `Clock`
Timestamps are stored in UTC. Contract dates and billing dates are UK
calendar dates, and you get today's date from the `Clock` in
`src/common/dates.py`. Never call `date.today()` or `datetime.now()`
directly.

**Why:** it makes code testable, and it keeps dates correct around the
clocks going forward and back.

## 4. Changing a contract
Load the contract, change it, then save it with
`ContractDatabaseClient.update(session, contract, expected_version)`. If
someone else changed the contract since you loaded it, this fails and the
API returns 409. Every change to a contract also records an audit entry,
using `AuditWriter`, in the same database transaction.

**Why:** two requests can arrive at the same time, and we're required to
keep a full history of changes to credit agreements.

## 5. Telling other services something happened
Save the event with `OutboxWriter.enqueue`, in the same transaction as the
change. A separate process (`src/cli/relay_outbox.py`) sends it. Never send
events directly. Event names and contents are defined in
`src/events/catalogue.py` and agreed with the teams that use them. Keep
event contents small: what happened and the relevant IDs. Other services
fetch anything else they need from our API.

**Why:** when we sent events directly, some were lost and some were sent
for changes that were then rolled back.

## 6. Every endpoint that changes data needs an idempotency key
Clients send an `Idempotency-Key` header, a unique value per action. If the
same request is sent twice, we return the first response instead of doing
the work again. Add the `idempotent` dependency to every endpoint that
creates or changes data.

**Why:** apps retry when a request times out. Before this, a retry once
charged a customer twice.

## 7. Database changes happen in steps
We deploy without downtime, so old and new code run side by side for a
while. For a new required column:
1. Add it as nullable, and have the code start writing to it
2. Fill in existing rows with a backfill script in `src/cli/`, not in the
   migration
3. In a later release, make it `NOT NULL` and start reading from it

Never update existing rows on the `contracts` table inside a migration.

**Why:** with 400,000 rows, it locks the table and caused an outage.

## 8. Don't break our API
The response from `GET /contracts/{uuid}` is used by other teams. Only add
fields; never rename or remove them. APIs only expose UUIDs, never
internal database IDs. URLs are kebab-case (`/billing-day-changes`) and
JSON fields are snake_case.

## 9. Errors
Controllers raise the errors in `src/common/errors.py`. They're turned into
the right HTTP responses automatically, so routes don't need to handle
them.

## 10. Tests
Most tests call the API and check the database afterwards, using a real
database. Use the factories in `tests/factories.py` to create test data.
Don't mock the thing you're testing, and cover each error case, not just
the happy path.

## 11. Keep it simple
Add abstractions, such as a pattern for handling several variations of
something, once there are three real cases. Not before.

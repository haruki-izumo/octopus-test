# How we build things

These are the rules we follow in the front-end. Each one exists because
something went wrong without it. Paths are relative to
`apps/customer-portal/`.

## 1. Call the API with `src/lib/api-client.ts`
Don't call `fetch` directly. For anything that changes data, get a key
with `createActionKey()` once per customer action, such as when a form is
opened, and pass it to `postJson`. The client retries timeouts and server
errors with the same key, and so should the customer pressing the button
again.

**Why:** a retry with a new key is treated as a new request, so a change
that timed out but went through would be made twice.

## 2. Prices come from the API
Show amounts with `formatPounds` from `src/lib/money.ts`, passing the
string the API returned. Never do arithmetic on money or work out prices
in the browser; if a page needs a figure, the API should provide it.

**Why:** a price worked out in the browser can differ by a penny from what
the customer is charged.

## 3. Show dates with `formatUkDate`
Show dates from the API, such as `"2026-10-01"`, with `formatUkDate` from
`src/lib/dates.ts`. Don't use `new Date(...)` and `toLocaleDateString`.

**Why:** `new Date("2026-10-01")` is midnight UTC, so anywhere west of UTC
it shows the day before.

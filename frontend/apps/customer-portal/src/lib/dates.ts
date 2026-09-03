const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// Dates are read and shown in UTC, so the calendar date is the same wherever the browser is.
const UK_DATE = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
})

/** Shows a calendar date from the API, such as "2026-10-01", as "1 October 2026". */
export function formatUkDate(isoDate: string): string {
    if (!ISO_DATE.test(isoDate)) {
        throw new Error(`Expected a date such as "2026-10-01", not "${isoDate}"`)
    }
    return UK_DATE.format(new Date(`${isoDate}T00:00:00Z`))
}

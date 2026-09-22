import { afterEach, describe, expect, it } from 'vitest'

import { formatUkDate } from './dates'

describe('formatUkDate', () => {
    const originalTimeZone = process.env.TZ

    afterEach(() => {
        if (originalTimeZone === undefined) {
            delete process.env.TZ
        } else {
            process.env.TZ = originalTimeZone
        }
    })

    it.each([
        ['2026-10-01', '1 October 2026'],
        ['2027-02-28', '28 February 2027'],
        ['2026-03-29', '29 March 2026'],
    ])('shows %s as %s', (isoDate, expected) => {
        expect(formatUkDate(isoDate)).toBe(expected)
    })

    it.each(['America/New_York', 'Pacific/Auckland'])('shows the same date in %s', (timeZone) => {
        process.env.TZ = timeZone

        expect(formatUkDate('2026-10-01')).toBe('1 October 2026')
    })

    it.each(['01/10/2026', '2026-10-01T00:00:00Z', ''])('rejects %j', (value) => {
        expect(() => formatUkDate(value)).toThrow('Expected a date')
    })
})

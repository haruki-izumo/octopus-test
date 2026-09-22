import { describe, expect, it } from 'vitest'

import { formatPounds } from './money'

describe('formatPounds', () => {
    it.each([
        ['765.56', '£765.56'],
        ['0.00', '£0.00'],
        ['1234.50', '£1,234.50'],
        ['31499.99', '£31,499.99'],
        ['-12.30', '-£12.30'],
    ])('shows %s as %s', (value, expected) => {
        expect(formatPounds(value)).toBe(expected)
    })

    it.each(['765.5', '765', '£765.56', 'abc', ''])('rejects %j', (value) => {
        expect(() => formatPounds(value)).toThrow('Expected an amount in pounds')
    })
})

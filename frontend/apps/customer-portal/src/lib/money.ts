const POUNDS = /^(-?)(\d+)\.(\d{2})$/

/** Shows an amount from the API, such as "1234.50", as "£1,234.50", without converting it to a number. */
export function formatPounds(value: string): string {
    const match = POUNDS.exec(value)
    if (!match) {
        throw new Error(`Expected an amount in pounds, such as "765.56", not "${value}"`)
    }
    const [, sign = '', pounds = '', pence = ''] = match
    return `${sign}£${BigInt(pounds).toLocaleString('en-GB')}.${pence}`
}

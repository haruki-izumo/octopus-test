const ORDINAL_RULES = new Intl.PluralRules('en-GB', { type: 'ordinal' })

const SUFFIXES: Record<Intl.LDMLPluralRule, string> = {
    zero: 'th',
    one: 'st',
    two: 'nd',
    few: 'rd',
    many: 'th',
    other: 'th',
}

/** 1 → "1st", 22 → "22nd", 13 → "13th". */
export function ordinal(value: number): string {
    return `${value}${SUFFIXES[ORDINAL_RULES.select(value)]}`
}

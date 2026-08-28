import type { ReactNode } from 'react'
import type {
    CheckboxFieldProps as AriaCheckboxFieldProps,
    ValidationResult,
} from 'react-aria-components'
import {
    CheckboxButton as AriaCheckboxButton,
    CheckboxField as AriaCheckboxField,
} from 'react-aria-components'

import { Description } from '../Description'
import { FieldError } from '../FieldError'

import styles from './Checkbox.module.css'

export type CheckboxProps = Omit<AriaCheckboxFieldProps, 'className' | 'children'> & {
    /** The content of the checkbox, typically a label describing the option. */
    children?: ReactNode
    /** Description text displayed below the checkbox */
    description?: string
    /** The error message for the checkbox */
    errorMessage?: string | ((validation: ValidationResult) => string)
}

/**
 * A Checkbox toggles a single on/off value. For multiple checkboxes in a group, use CheckboxGroup instead
 *
 * @example
 * ```tsx
 * <Checkbox>Accept terms and conditions</Checkbox>
 * ```
 *
 * @summary A checkbox toggles a single on/off value
 * @import import { Checkbox } from "@octoev/mosaic/Checkbox";
 */
export function Checkbox({ children, description, errorMessage, ...props }: CheckboxProps) {
    return (
        <AriaCheckboxField className={styles.checkboxField} {...props}>
            <AriaCheckboxButton className={styles.checkboxButton}>
                <span className={styles.indicator} aria-hidden="true">
                    <svg viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <title>Checkbox indicator</title>
                        <path
                            className={styles.checkmark}
                            pathLength="1"
                            d="M1.5 5.5L4.5 8.5L10.5 1.5"
                        />
                        <path className={styles.indeterminate} pathLength="1" d="M2 5H10" />
                    </svg>
                </span>
                {children}
            </AriaCheckboxButton>
            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>
        </AriaCheckboxField>
    )
}

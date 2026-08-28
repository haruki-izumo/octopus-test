import type { ReactNode } from 'react'
import type {
    CheckboxGroupProps as AriaCheckboxGroupProps,
    ValidationResult,
} from 'react-aria-components'
import { CheckboxGroup as AriaCheckboxGroup } from 'react-aria-components'

import { Description } from '../Description'
import { FieldError } from '../FieldError'
import { Label } from '../Label'

import styles from './CheckboxGroup.module.css'

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'children' | 'className'> {
    /** The content of the checkbox group, typically a set of Checkbox components. */
    children?: ReactNode
    /** The label for the checkbox group */
    label?: ReactNode
    /** Description text displayed below the checkbox group */
    description?: string
    /** The error message for the checkbox group */
    errorMessage?: string | ((validation: ValidationResult) => string)
}

/**
 * A CheckboxGroup manages a set of checkboxes, allowing the user to select multiple options from a group. For a single standalone checkbox (like "Accept terms and conditions"), use Checkbox instead
 *
 * @example
 * ```tsx
 * <CheckboxGroup label="Email preferences">
 *    <Checkbox value="product">Product updates</Checkbox>
 *    <Checkbox value="security">Security alerts</Checkbox>
 *    <Checkbox value="marketing">Marketing emails</Checkbox>
 * </CheckboxGroup>
 * ```
 *
 * @summary A group of checkboxes allowing multiple selections
 * @import import { CheckboxGroup } from "@octoev/mosaic/CheckboxGroup";
 */
export function CheckboxGroup({
    children,
    label,
    description,
    errorMessage,
    validationBehavior = 'aria',
    ...props
}: CheckboxGroupProps) {
    return (
        <AriaCheckboxGroup
            className={styles.checkboxGroup}
            validationBehavior={validationBehavior}
            {...props}
        >
            {label && <Label>{label}</Label>}
            <div className={styles.items}>{children}</div>
            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>
        </AriaCheckboxGroup>
    )
}

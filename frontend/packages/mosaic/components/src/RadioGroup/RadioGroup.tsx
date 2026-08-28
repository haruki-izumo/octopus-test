import type React from 'react'
import type {
    RadioButtonRenderProps as AriaRadioButtonRenderProps,
    RadioFieldProps as AriaRadioFieldProps,
    RadioGroupProps as AriaRadioGroupProps,
    ValidationResult,
} from 'react-aria-components'
import {
    RadioButton as AriaRadioButton,
    RadioField as AriaRadioField,
    RadioGroup as AriaRadioGroup,
    composeRenderProps,
} from 'react-aria-components'

import { Description } from '../Description'
import { FieldError } from '../FieldError'
import { Label } from '../Label'

import styles from './RadioGroup.module.css'

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'className'> {
    /** Label text for the radio group. Always rendered for accessibility */
    label?: string
    /** Description text displayed below the label */
    description?: string
    /** The error message for the radio group */
    errorMessage?: string | ((validation: ValidationResult) => string)
    /** The children of the radio group, typically `Radio` components */
    children?: React.ReactNode
}

/**
 * A radio group allows a user to select a single item from a list of mutually exclusive options
 *
 * @example
 * ```tsx
 * <RadioGroup label="Body type">
 *   <Radio value="hatchback">Hatchback</Radio>
 *   <Radio value="estate">Estate</Radio>
 *   <Radio value="suv">SUV</Radio>
 * </RadioGroup>
 * ```
 *
 * @summary A group of radio buttons allowing a single selection
 * @import import { RadioGroup, Radio } from "@octoev/mosaic/RadioGroup";
 */
export function RadioGroup({
    label,
    description,
    errorMessage,
    children,
    validationBehavior = 'aria',
    ...props
}: RadioGroupProps) {
    return (
        <AriaRadioGroup
            className={styles.radioGroup}
            validationBehavior={validationBehavior}
            {...props}
        >
            {label && <Label>{label}</Label>}
            <div className={styles.radioItems}>{children}</div>
            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>
        </AriaRadioGroup>
    )
}

export interface RadioProps extends Omit<AriaRadioFieldProps, 'className' | 'children'> {
    /** Description text displayed below the radio button label */
    description?: string
    /** The children of the radio button, typically the label text */
    children: React.ReactNode | ((renderProps: AriaRadioButtonRenderProps) => React.ReactNode)
}

/**
 * A Radio represents an individual option within a radio group, containing a RadioButton and optional description
 *
 * @example
 * ```tsx
 * <Radio value="hatchback">Hatchback</Radio>
 * ```
 *
 * @summary A single radio button within a radio group
 * @import import { Radio } from "@octoev/mosaic/RadioGroup";
 */
export function Radio({ description, children, ...props }: RadioProps) {
    return (
        <AriaRadioField className={styles.radioField} {...props}>
            <AriaRadioButton className={styles.radioButton}>
                {composeRenderProps(children, (resolvedChildren) => (
                    <>
                        <div className={styles.indicator} />
                        {resolvedChildren}
                    </>
                ))}
            </AriaRadioButton>
            {description && <Description>{description}</Description>}
        </AriaRadioField>
    )
}

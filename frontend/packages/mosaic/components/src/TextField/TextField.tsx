import type React from 'react'
import type { TextFieldProps as AriaTextFieldProps, ValidationResult } from 'react-aria-components'
import { TextField as AriaTextField, Input } from 'react-aria-components'

import { Description } from '../Description'
import { FieldError } from '../FieldError'
import { Label } from '../Label'

import styles from './TextField.module.css'

export interface TextFieldProps<T = HTMLInputElement>
    extends Omit<AriaTextFieldProps, 'className'> {
    /** Label text for the text field. Always rendered for accessibility */
    label?: string
    /** Description text displayed below the label */
    description?: string
    /** The error message for the text field */
    errorMessage?: string | ((validation: ValidationResult) => string)
    /** Placeholder text shown when the text field is empty */
    placeholder?: string
    /** Ref to the underlying text field element */
    inputRef?: React.Ref<T>
}

/**
 * TextField is a single-line text input for collecting short-form content like names, email addresses, or search queries. Use it when the expected input fits on a single line. For longer, multi-line values, use TextArea instead.
 *
 * @example
 * <TextField label="Name" placeholder="Enter your name" />
 *
 * @summary A single-line text input field component
 * @import import { TextField } from "@octoev/mosaic/TextField";
 */
export function TextField({
    label,
    description,
    errorMessage,
    placeholder,
    inputRef,
    ...props
}: TextFieldProps<HTMLInputElement>) {
    return (
        <AriaTextField className={styles.textField} {...props}>
            {label && <Label>{label}</Label>}
            <Input ref={inputRef} className={styles.input} placeholder={placeholder} />
            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>
        </AriaTextField>
    )
}

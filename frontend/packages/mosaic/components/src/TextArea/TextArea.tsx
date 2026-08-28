import type React from 'react'
import type { TextFieldProps as AriaTextFieldProps, ValidationResult } from 'react-aria-components'
import { TextArea as AriaTextArea, TextField as AriaTextField } from 'react-aria-components'

import { Description } from '../Description'
import { FieldError } from '../FieldError'
import { Label } from '../Label'

import styles from './TextArea.module.css'

export interface TextAreaProps<T = HTMLTextAreaElement>
    extends Omit<AriaTextFieldProps, 'className'> {
    /** Label text for the textarea. Always rendered for accessibility */
    label?: string
    /** Description text displayed below the label */
    description?: string
    /** The error message for the textarea */
    errorMessage?: string | ((validation: ValidationResult) => string)
    /** Placeholder text shown when the textarea is empty */
    placeholder?: string
    /** Ref to the underlying textarea element */
    inputRef?: React.Ref<T>
}

/**
 * TextArea is a multi-line text input for collecting longer-form content like comments, descriptions, or messages. Use it when the expected input spans multiple lines. For shorter, single-line values, use TextField instead
 *
 * @example
 * ```tsx
 * <TextArea label="Message" placeholder="Enter your message here..." />
 * ```
 *
 * @summary A multi-line text input field component
 * @import import { TextArea } from "@octoev/mosaic/TextArea";
 */
export function TextArea({
    label,
    description,
    errorMessage,
    placeholder,
    inputRef,
    ...props
}: TextAreaProps<HTMLTextAreaElement>) {
    return (
        <AriaTextField className={styles.textField} {...props}>
            {label && <Label>{label}</Label>}
            <AriaTextArea ref={inputRef} className={styles.textArea} placeholder={placeholder} />
            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>
        </AriaTextField>
    )
}

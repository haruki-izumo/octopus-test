import type { FieldErrorProps as AriaFieldErrorProps } from 'react-aria-components'
import { FieldError as AriaFieldError } from 'react-aria-components'

import styles from './FieldError.module.css'

export interface FieldErrorProps extends Omit<AriaFieldErrorProps, 'className'> {}

/**
 * A FieldError displays validation errors for a form control
 *
 * @summary Displays validation errors for a form control
 * @import import { FieldError } from "@octoev/mosaic/FieldError";
 */
export function FieldError(props: FieldErrorProps) {
    return <AriaFieldError {...props} className={styles.fieldError} />
}

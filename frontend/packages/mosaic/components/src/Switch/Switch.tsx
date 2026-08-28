import type { ReactNode } from 'react'
import type {
    SwitchFieldProps as AriaSwitchFieldProps,
    ValidationResult,
} from 'react-aria-components'
import {
    SwitchButton as AriaSwitchButton,
    SwitchField as AriaSwitchField,
} from 'react-aria-components'

import { Description } from '../Description'
import { FieldError } from '../FieldError'

import styles from './Switch.module.css'

export interface SwitchProps extends Omit<AriaSwitchFieldProps, 'className' | 'children'> {
    /** Label text for the switch. Always rendered for accessibility */
    children: ReactNode
    /** Description text displayed below the switch */
    description?: string
    /** The error message for the switch */
    errorMessage?: string | ((validation: ValidationResult) => string)
}

/**
 * A switch allows a user to turn a setting on or off. Use it for settings or preferences that apply instantly. For changes requiring a form submission, use a Checkbox instead
 *
 * @example
 * ```tsx
 * <Switch>Label</Switch>
 * ```
 *
 * @summary A toggle switch component
 * @import import { Switch } from "@octoev/mosaic/Switch";
 */
export function Switch({ children, description, errorMessage, ...props }: SwitchProps) {
    return (
        <AriaSwitchField className={styles.switch} {...props}>
            <AriaSwitchButton className={styles.switchButton}>
                {({ isDisabled }) => (
                    <>
                        <div className={styles.track}>
                            <div
                                data-disabled={isDisabled || undefined}
                                className={styles.handle}
                            />
                        </div>
                        {children}
                    </>
                )}
            </AriaSwitchButton>
            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>
        </AriaSwitchField>
    )
}

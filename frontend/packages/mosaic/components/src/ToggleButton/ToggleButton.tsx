import type { ToggleButtonProps as AriaToggleButtonProps } from 'react-aria-components'
import { ToggleButton as AriaToggleButton, composeRenderProps } from 'react-aria-components'

import styles from './ToggleButton.module.css'

export interface ToggleButtonProps extends Omit<AriaToggleButtonProps, 'className'> {}

/**
 * ToggleButton switches between selected and unselected states to represent a persistent on/off choice. Use it standalone for binary actions like bold, mute, or favorite, or inside a ToggleButtonGroup for single-select or multi-select toolbar controls
 *
 * @example
 * ```tsx
 * <ToggleButton>Pin</ToggleButton>
 * ```
 *
 * @summary A toggle button component for switching between two states or modes.
 * @import import { ToggleButton } from "@octoev/mosaic/ToggleButton";
 */
export function ToggleButton({ children, ...props }: ToggleButtonProps) {
    return (
        <AriaToggleButton data-toggle-button className={styles.toggleButton} {...props}>
            {composeRenderProps(children, (children) => (
                <span>{children}</span>
            ))}
        </AriaToggleButton>
    )
}

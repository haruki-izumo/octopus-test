import type { ToggleButtonGroupProps as AriaToggleButtonGroupProps } from 'react-aria-components'
import { ToggleButtonGroup as AriaToggleButtonGroup } from 'react-aria-components'

import styles from './ToggleButtonGroup.module.css'

export interface ToggleButtonGroupProps extends Omit<AriaToggleButtonGroupProps, 'className'> {}

/**
 * A toggle button group allows a user to toggle multiple options, with single or multiple selection
 *
 * @example
 * ```tsx
 * <ToggleButtonGroup aria-label="Proposition">
 *    <ToggleButton id="left">Salary Sacrifice</ToggleButton>
 *    <ToggleButton id="center">Personal</ToggleButton>
 *    <ToggleButton id="right">Business</ToggleButton>
 * </ToggleButtonGroup>
 * ```
 *
 * @summary A group of toggle buttons for selecting one or multiple options
 * @import import { ToggleButtonGroup } from "@octoev/mosaic/ToggleButtonGroup";
 */
export function ToggleButtonGroup({ ...props }: ToggleButtonGroupProps) {
    return <AriaToggleButtonGroup className={styles.toggleButtonGroup} {...props} />
}

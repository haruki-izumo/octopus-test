import type { SeparatorProps as AriaSeparatorProps } from 'react-aria-components'
import { Separator as AriaSeparator } from 'react-aria-components'

import styles from './Divider.module.css'

export interface DividerProps extends Omit<AriaSeparatorProps, 'className'> {}

/**
 * A divider is a visual separator between two groups of content, e.g. sections of a page or groups of items
 *
 * @example
 * ```tsx
 * <Divider />
 * ```
 *
 * @summary A horizontal or vertical line that separates content
 * @import import { Divider } from "@octoev/mosaic/Divider";
 */
export function Divider(props: DividerProps) {
    return <AriaSeparator className={styles.divider} {...props} />
}

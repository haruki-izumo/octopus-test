import type { TextProps as AriaTextProps } from 'react-aria-components'
import { Text as AriaText } from 'react-aria-components'

import styles from './Description.module.css'

export interface DescriptionProps extends Omit<AriaTextProps, 'className' | 'slot'> {
    /**
     * The HTML element type to render the description as.
     * @default "span"
     */
    elementType?: 'div' | 'span'
}

/**
 * The Description component provides supporting text for a form control
 *
 * @summary Supporting text for form controls
 * @import import { Description } from "@octoev/mosaic/Description";
 */
export function Description(props: DescriptionProps) {
    return <AriaText {...props} slot="description" className={styles.description} />
}

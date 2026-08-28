import type { LabelProps as AriaLabelProps } from 'react-aria-components'
import { Label as AriaLabel } from 'react-aria-components'

import styles from './Label.module.css'

export interface LabelProps extends Omit<AriaLabelProps, 'className'> {
    /**
     * The HTML element type to render the label as.
     * @default "label"
     */
    elementType?: 'label' | 'span'
}

/**
 * The Label component provides an accessible label for form elements
 *
 * @summary Accessible label for form elements
 * @import import { Label } from "@octoev/mosaic/Label";
 */
export function Label(props: LabelProps) {
    return <AriaLabel className={styles.label} {...props} />
}

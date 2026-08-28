import type { LinkProps as AriaLinkProps } from 'react-aria-components'
import { Link as AriaLink } from 'react-aria-components'

import styles from './Link.module.css'

export interface LinkProps extends Omit<AriaLinkProps, 'className'> {}

/**
 * A link allows a user to navigate to another page or resource within a web page or application. Supports external links and custom link components for router integration
 *
 * @example
 * ```tsx
 * <Link href="https://www.octopusev.com/" target="_blank">Octopus EV</Link>
 * ```
 *
 * @summary A styled anchor for inline and standalone text navigation
 * @import import { Link } from "@octoev/mosaic/Link";
 */
export function Link(props: LinkProps) {
    return <AriaLink className={styles.link} {...props} />
}

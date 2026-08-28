import { ChevronRight } from '@octoev/mosaic-icons'
import type {
    BreadcrumbProps as AriaBreadcrumbProps,
    BreadcrumbsProps as AriaBreadcrumbsProps,
    LinkProps as AriaLinkProps,
} from 'react-aria-components'
import {
    Breadcrumb as AriaBreadcrumb,
    Breadcrumbs as AriaBreadcrumbs,
    Link as AriaLink,
} from 'react-aria-components'

import styles from './Breadcrumbs.module.css'

export interface BreadcrumbsProps<T> extends Omit<AriaBreadcrumbsProps<T>, 'className'> {}

/**
 * Breadcrumbs consist of a list of links to the parent pages of the current page in hierarchical order. It helps users find their place within a website or web application. Breadcrumbs are often placed horizontally before a page's main content
 *
 * @example
 * ```tsx
 * <Breadcrumbs>
 *   <Breadcrumb href="/">Home</Breadcrumb>
 *   <Breadcrumb href="/drivers">Drivers</Breadcrumb>
 *   <Breadcrumb>Driver</Breadcrumb>
 * </Breadcrumbs>
 * ```
 *
 * @summary A navigation aid that displays the hierarchical structure of the current page within a website or web application
 * @import import { Breadcrumbs, Breadcrumb } from "@octoev/mosaic/Breadcrumbs";
 */
export function Breadcrumbs<T>({ ...props }: BreadcrumbsProps<T>) {
    return <AriaBreadcrumbs className={styles.breadcrumbs} {...props} />
}

export interface BreadcrumbProps extends Omit<AriaBreadcrumbProps, 'className'> {}

/**
 * A single breadcrumb item within the breadcrumbs navigation.
 *
 * @example
 * ```tsx
 * <Breadcrumb href="/">Home</Breadcrumb>
 * ```
 */
export function Breadcrumb({ ...props }: BreadcrumbProps & Omit<AriaLinkProps, 'className'>) {
    return (
        <AriaBreadcrumb className={styles.breadcrumb} {...props}>
            {({ isCurrent }) => (
                <>
                    <AriaLink className={styles.breadcrumbLink} {...props} />
                    {!isCurrent && <ChevronRight size={16} />}
                </>
            )}
        </AriaBreadcrumb>
    )
}

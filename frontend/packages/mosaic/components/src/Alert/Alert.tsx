import {
    CircleAlert,
    CircleCheck,
    Info,
    type LucideIcon,
    TriangleAlert,
    X,
} from '@octoev/mosaic-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'
import { Button } from 'react-aria-components'

import styles from './Alert.module.css'

const DEFAULT_VARIANT = 'information'

const alertVariants = cva(styles.alert, {
    variants: {
        variant: {
            information: styles.information,
            success: styles.success,
            warning: styles.warning,
            danger: styles.danger,
        },
        bordered: {
            true: styles.bordered,
            false: styles.solid,
        },
    },
    defaultVariants: {
        variant: DEFAULT_VARIANT,
        bordered: false,
    },
})

const defaultIcons = {
    information: Info,
    success: CircleCheck,
    warning: TriangleAlert,
    danger: CircleAlert,
} as const

const announceRoles = {
    polite: 'status',
    assertive: 'alert',
} as const

export type AlertVariant = NonNullable<VariantProps<typeof alertVariants>['variant']>

export interface AlertProps
    extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'role' | 'className'> {
    /**
     * The status this alert communicates. Sets the colour palette and default icon.
     * @default 'information'
     */
    variant?: AlertVariant
    /**
     * Renders a coloured border on a light background instead of a solid fill. Less visually imposing; use inline alongside body copy.
     * @default false
     */
    bordered?: boolean
    /** The alert title. Always rendered and required for accessibility. */
    title: ReactNode
    /**
     * Render the title as a heading element for the document outline.
     * @default 'p'
     */
    titleAs?: 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    /**
     * Announces the alert to screen readers when it appears. "assertive" interrupts immediately; "polite" waits for a pause. Omit for alerts present on page load.
     *
     * The live region is created as the alert mounts, so "polite" is not reliably announced unless the alert renders inside a live region that already exists. "assertive" is announced consistently.
     */
    announce?: 'polite' | 'assertive'
    /** Override the default variant icon. Accepts any Mosaic icon, imported from `@octoev/mosaic-icons`. */
    icon?: LucideIcon
    /** Renders a dismiss button. The parent must remove the alert from the DOM and move focus once it has gone. */
    onDismiss?: () => void
    /**
     * Accessible name for the dismiss button.
     * @default 'Dismiss'
     */
    dismissLabel?: string
    /** Body content. Expects an `AlertContent` element; omit when the title alone carries the message. */
    children?: ReactNode
}

/**
 * In-page status message for a temporary or real-time condition: a check in progress,
 * a price that may change, an action that failed.
 *
 * `title` alone is usually enough; add `AlertContent` only when it is not.
 *
 * Not announced to screen readers by default. Set `announce` when the alert appears in
 * response to a user action rather than on page load. The live region is created as the
 * alert mounts, so `"polite"` is not reliably announced unless the alert renders inside a
 * live region that already exists; `"assertive"` is announced consistently.
 *
 * Does not manage its own visibility or focus. After `onDismiss` unmounts the alert, move
 * focus to whatever replaces it, the element it described, or the nearest preceding
 * focusable element. Otherwise focus falls to `<body>`.
 *
 * Do not use for:
 * - **Form validation errors.** Field errors belong on the field. Page-level summaries
 *   use the dedicated `errorMessages` / `ErrorList` pattern.
 * - **Transient notifications.** No dismissal timing, positioning or stacking. Use the
 *   Toast component; do not approximate it with Alert.
 * - **Blocking confirmations.** Use `Modal`.
 * - **Field hint or helper text.** Use the field's own description prop.
 * - **Generic callouts or containers.** Alert carries status semantics and a variant colour.
 *
 * @summary for communicating a temporary or real-time status message on the page
 * @import import { Alert } from "@octoev/mosaic/Alert";
 */
export function Alert({
    variant = DEFAULT_VARIANT,
    bordered,
    title,
    titleAs = 'p',
    announce,
    icon,
    onDismiss,
    dismissLabel = 'Dismiss',
    children,
    ...props
}: AlertProps) {
    const IconComponent = icon ?? defaultIcons[variant]
    return (
        <div
            {...props}
            role={announce && announceRoles[announce]}
            className={alertVariants({ variant, bordered })}
        >
            <span className={styles.icon} aria-hidden={true}>
                <IconComponent size={20} />
            </span>
            <div className={styles.content}>
                <AlertTitle as={titleAs}>{title}</AlertTitle>
                {children}
            </div>
            {onDismiss && (
                <Button className={styles.dismiss} aria-label={dismissLabel} onPress={onDismiss}>
                    <X size={20} />
                </Button>
            )}
        </div>
    )
}

interface AlertTitleProps {
    as?: 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    children: ReactNode
}

function AlertTitle({ as: Tag = 'p', children }: AlertTitleProps) {
    return <Tag className={styles.title}>{children}</Tag>
}

export interface AlertContentProps {
    children: ReactNode
}

/**
 * Body content inside an `Alert`. Accepts arbitrary children, including links and buttons.
 *
 * @summary for body content inside an Alert
 * @import import { AlertContent } from "@octoev/mosaic/Alert";
 */
export function AlertContent({ children }: AlertContentProps) {
    return <div className={styles.description}>{children}</div>
}

import { cva } from 'class-variance-authority'
import type { CSSProperties, ReactNode } from 'react'
import { useContext } from 'react'
import type {
    QueuedToast as AriaQueuedToast,
    ToastOptions as AriaToastOptions,
    ToastProps as AriaToastProps,
    ToastRegionProps as AriaToastRegionProps,
    ToastState as AriaToastState,
} from 'react-aria-components'
import {
    UNSTABLE_Toast as AriaToast,
    UNSTABLE_ToastContent as AriaToastContent,
    UNSTABLE_ToastQueue as AriaToastQueue,
    UNSTABLE_ToastRegion as AriaToastRegion,
    UNSTABLE_ToastStateContext as AriaToastStateContext,
    Text,
} from 'react-aria-components'
import { flushSync } from 'react-dom'
import type { AlertVariant } from '../Alert'
import { Alert, AlertContent } from '../Alert'

import styles from './Toast.module.css'

export type { AriaToastOptions as ToastOptions }

export type ToastQueueOptions = ConstructorParameters<typeof AriaToastQueue>[0]

/**
 * Creates a typed toast queue with CSS View Transition animations pre-wired.
 * Create one queue per toast region and export it from a shared file so it can
 * be called from anywhere in your app.
 *
 * @example
 * export const toastQueue = createToastQueue<{ title: string; description?: string }>();
 *
 * @summary for creating the queue a ToastRegion renders and consumers call add() on
 * @import import { createToastQueue } from "@octoev/mosaic/Toast";
 */
export function createToastQueue<T>(options?: ToastQueueOptions) {
    return new AriaToastQueue<T>({
        wrapUpdate(fn) {
            const prefersReducedMotion = window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches

            if (!prefersReducedMotion && 'startViewTransition' in document) {
                document.startViewTransition(() => {
                    flushSync(fn)
                })
            } else {
                fn()
            }
        },
        ...options,
    })
}

export type ToastPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

const DEFAULT_POSITION = 'bottom-right'

const regionVariants = cva(styles.region, {
    variants: {
        position: {
            'bottom-right': styles.bottomRight,
            'bottom-left': styles.bottomLeft,
            'top-right': styles.topRight,
            'top-left': styles.topLeft,
        },
    },
    defaultVariants: {
        position: DEFAULT_POSITION,
    },
})

export interface ToastRegionProps<T> extends Omit<AriaToastRegionProps<T>, 'className'> {
    /**
     * Where to anchor the toast stack in the viewport.
     * @default 'bottom-right'
     */
    position?: ToastPosition
}

/**
 * Mounts a queue's toast stack at a fixed corner of the viewport. Mount once
 * per queue, typically near your app root, with a render prop that returns
 * `ToastLayout` (or custom content) for each toast.
 *
 * Renders as a WAI-ARIA landmark region — keyboard users can jump to it with
 * F6 and back with Shift+F6.
 *
 * @summary for mounting a toast queue's stack in the viewport
 * @import import { ToastRegion } from "@octoev/mosaic/Toast";
 */
export function ToastRegion<T>({ position = DEFAULT_POSITION, ...props }: ToastRegionProps<T>) {
    return <AriaToastRegion className={regionVariants({ position })} {...props} />
}

export type ToastProps<T> = Omit<AriaToastProps<T>, 'className' | 'style'>

/**
 * The unstyled toast wrapper — applies positioning, exit animation and the RAC
 * toast role to its children. Use it directly only when composing custom
 * content beyond what `ToastLayout` offers.
 *
 * @summary for composing custom toast content beyond ToastLayout
 * @import import { Toast } from "@octoev/mosaic/Toast";
 */
export function Toast<T>({ toast, ...props }: ToastProps<T>) {
    return (
        <AriaToast
            toast={toast}
            className={styles.toast}
            style={{ viewTransitionName: toast.key } as CSSProperties}
            {...props}
        />
    )
}

/**
 * Reads the enclosing ToastRegion's queue state. Used to close a toast from
 * custom content composed with the raw `Toast` primitive.
 *
 * @summary for closing a toast from custom content composed with the raw Toast primitive
 * @import import { useToastState } from "@octoev/mosaic/Toast";
 */
export function useToastState<T>(): AriaToastState<T> | null {
    return useContext(AriaToastStateContext) as AriaToastState<T> | null
}

export interface ToastLayoutProps<T> {
    /** The queued toast this layout renders, supplied by `ToastRegion`'s render prop. */
    toast: AriaQueuedToast<T>
    /**
     * Status variant passed to the internal Alert.
     * @default 'information'
     */
    variant?: AlertVariant
    /** The toast title. Always rendered and required for accessibility. */
    title: ReactNode
    /** Body content below the title. Expects a `ToastDescription` element. */
    children?: ReactNode
    /**
     * Accessible name for the dismiss button.
     * @default 'Dismiss'
     */
    dismissLabel?: string
}

/**
 * A pre-built layout that wraps a Toast in an Alert with a title, optional
 * content, and a dismiss button already wired up to close the toast. Covers
 * the common case — reach for the raw `Toast` primitive only when this
 * layout doesn't fit.
 *
 * @summary for the common case: a toast with a title, optional content and a dismiss button
 * @import import { ToastLayout } from "@octoev/mosaic/Toast";
 */
export function ToastLayout<T>({
    toast,
    variant = 'information',
    title,
    children,
    dismissLabel,
}: ToastLayoutProps<T>) {
    // Only populated inside a ToastRegion's render prop.
    const state = useToastState<T>()
    return (
        <Toast toast={toast}>
            {/* ToastContent carries RAC's role="alert"; the Text slots carry the ids the
          toast root references via aria-labelledby/aria-describedby. */}
            <AriaToastContent>
                <Alert
                    variant={variant}
                    title={<Text slot="title">{title}</Text>}
                    dismissLabel={dismissLabel}
                    onDismiss={() => state?.close(toast.key)}
                >
                    {/* The toast root always references the description id, so the slot is
              filled even when there is no description, to avoid a dangling ref. */}
                    {children || <Text slot="description" />}
                </Alert>
            </AriaToastContent>
        </Toast>
    )
}

export interface ToastDescriptionProps {
    /** The description content. */
    children: ReactNode
}

/**
 * Body content below a toast's title. Accepts arbitrary children, including links
 * and buttons.
 *
 * @summary for body content below a toast title
 * @import import { ToastDescription } from "@octoev/mosaic/Toast";
 */
export function ToastDescription({ children }: ToastDescriptionProps) {
    return (
        <AlertContent>
            <Text slot="description">{children}</Text>
        </AlertContent>
    )
}

export type { AriaQueuedToast as QueuedToast, AriaToastState as ToastState }

import type { ReactNode } from 'react'
import type {
    TooltipProps as AriaTooltipProps,
    TooltipTriggerComponentProps,
} from 'react-aria-components'
import {
    Tooltip as AriaTooltip,
    TooltipTrigger as AriaTooltipTrigger,
    OverlayArrow,
} from 'react-aria-components'

import styles from './Tooltip.module.css'

export interface TooltipProps extends Omit<AriaTooltipProps, 'className'> {
    /** The content to display in the tooltip */
    children: ReactNode
    /** The placement of the tooltip relative to the trigger
     * @default 'top'
     */
    placement?: 'left' | 'right' | 'top' | 'bottom'
}

/**
 * A short text hint that appears on hover or focus, anchored to a trigger element. Use it to describe icon-only buttons, show the full text of truncated labels, or provide supplementary context without cluttering the UI
 *
 * @example
 * ```tsx
 * <TooltipTrigger>
 *   <Button aria-label="Edit">
 *     <SquarePen size={20} />
 *   </Button>
 *   <Tooltip>Edit</Tooltip>
 * </TooltipTrigger>
 * ```
 *
 * @summary A tooltip displays a description of an element on hover or focus
 * @import import { Tooltip } from "@octoev/mosaic/Tooltip";
 */
export function Tooltip({ children, ...props }: TooltipProps) {
    return (
        <AriaTooltip className={styles.tooltip} {...props}>
            <OverlayArrow className={styles.overlayArrow}>
                <svg width={8} height={8} viewBox="0 0 8 8">
                    <title>Tooltip arrow</title>
                    <path d="M0 0 L4 4 L8 0" />
                </svg>
            </OverlayArrow>
            {children}
        </AriaTooltip>
    )
}

export interface TooltipTriggerProps extends TooltipTriggerComponentProps {
    /** The delay in milliseconds for the tooltip to show up
     * @default 1500
     */
    delay?: number
}

/**
 * TooltipTrigger wraps around a trigger element and a Tooltip. It handles opening and closing the Tooltip when the user hovers over or focuses the trigger, and positioning the Tooltip relative to the trigger
 *
 * @summary A component that wraps a trigger element and a Tooltip, managing its visibility and positioning
 * @import import { TooltipTrigger } from "@octoev/mosaic/Tooltip";
 */
export function TooltipTrigger(props: TooltipTriggerProps) {
    return <AriaTooltipTrigger {...props} />
}

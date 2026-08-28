import {
    type CSSProperties,
    createElement,
    type HTMLAttributes,
    type ReactNode,
    type Ref,
} from 'react'

import styles from './Box.module.css'

type BoxSpacing = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10
type BoxSizeValue = number | string

export interface BoxProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'style'> {
    /** Ref forwarded to the root element. */
    ref?: Ref<HTMLElement>
    /**
     * The element type to render.
     * @default "div"
     */
    as?: 'div' | 'span'
    /** Padding on all sides, as a step on the spacing scale. */
    p?: BoxSpacing
    /** Horizontal padding. Overrides `p`. */
    px?: BoxSpacing
    /** Vertical padding. Overrides `p`. */
    py?: BoxSpacing
    /** Top padding. Overrides `py` and `p`. */
    pt?: BoxSpacing
    /** Right padding. Overrides `px` and `p`. */
    pr?: BoxSpacing
    /** Bottom padding. Overrides `py` and `p`. */
    pb?: BoxSpacing
    /** Left padding. Overrides `px` and `p`. */
    pl?: BoxSpacing
    /** Width of the box. Numbers are treated as pixels. */
    width?: BoxSizeValue
    /** Minimum width of the box. Numbers are treated as pixels. */
    minWidth?: BoxSizeValue
    /** Maximum width of the box. Numbers are treated as pixels. */
    maxWidth?: BoxSizeValue
    /** Height of the box. Numbers are treated as pixels. */
    height?: BoxSizeValue
    /** Minimum height of the box. Numbers are treated as pixels. */
    minHeight?: BoxSizeValue
    /** Maximum height of the box. Numbers are treated as pixels. */
    maxHeight?: BoxSizeValue
    /** Content to render inside the box. */
    children?: ReactNode
}

function spacingVar(step: BoxSpacing) {
    return `var(--mds-box-spacing-${String(step).replace('.', '-')})`
}

function toCssSize(value: BoxSizeValue | undefined) {
    return typeof value === 'number' ? `${value}px` : value
}

/**
 * Box is the fundamental layout building block. Use it to add padding around content or to
 * constrain its size.
 *
 * @example
 * ```tsx
 * <Box p={4} maxWidth="480px">
 *   Content
 * </Box>
 * ```
 *
 * @summary A layout primitive for padding and sizing content
 * @import import { Box } from "@octoev/mosaic/Box";
 */
export function Box({
    as: element = 'div',
    p,
    px,
    py,
    pt,
    pr,
    pb,
    pl,
    width,
    minWidth,
    maxWidth,
    height,
    minHeight,
    maxHeight,
    children,
    ref,
    ...props
}: BoxProps) {
    const style: CSSProperties & Record<`--box-${string}`, string> = {
        width: toCssSize(width),
        minWidth: toCssSize(minWidth),
        maxWidth: toCssSize(maxWidth),
        height: toCssSize(height),
        minHeight: toCssSize(minHeight),
        maxHeight: toCssSize(maxHeight),
    }
    const classNames: string[] = []

    const sides = [
        ['pt', pt ?? py ?? p],
        ['pr', pr ?? px ?? p],
        ['pb', pb ?? py ?? p],
        ['pl', pl ?? px ?? p],
    ] as const

    // The class is only added when set, so nested Boxes ignore an inherited `--box-*` value.
    for (const [side, step] of sides) {
        const className = styles[side]
        if (step != null && className) {
            classNames.push(className)
            style[`--box-${side}`] = spacingVar(step)
        }
    }

    return createElement(
        element,
        {
            ...props,
            ref,
            className: classNames.join(' ') || undefined,
            style,
        },
        children,
    )
}

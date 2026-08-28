import { cva, cx } from 'class-variance-authority'
import {
    type CSSProperties,
    createElement,
    type HTMLAttributes,
    type ReactNode,
    type Ref,
} from 'react'

import styles from './Stack.module.css'

const stackVariants = cva(styles.stack, {
    variants: {
        direction: {
            horizontal: styles.horizontal,
            vertical: styles.vertical,
        },
        justify: {
            start: styles.mainStart,
            center: styles.mainCenter,
            end: styles.mainEnd,
            between: styles.mainBetween,
            around: styles.mainAround,
            evenly: styles.mainEvenly,
        },
        align: {
            start: styles.crossStart,
            center: styles.crossCenter,
            end: styles.crossEnd,
            stretch: styles.crossStretch,
        },
        wrap: {
            nowrap: styles.nowrap,
            wrap: styles.wrap,
            'wrap-reverse': styles.wrapReverse,
        },
        isScrollable: {
            true: styles.scrollable,
            false: null,
        },
    },
    defaultVariants: {
        direction: 'vertical',
    },
})

const stackItemVariants = cva(styles.item, {
    variants: {
        size: {
            static: styles.itemStatic,
            fill: styles.itemFill,
        },
        crossAlignSelf: {
            start: styles.itemAlignSelfStart,
            center: styles.itemAlignSelfCenter,
            end: styles.itemAlignSelfEnd,
            stretch: styles.itemAlignSelfStretch,
        },
        isScrollable: {
            true: styles.scrollable,
            false: null,
        },
    },
    defaultVariants: {
        size: 'static',
    },
})

type StackDirection = 'horizontal' | 'vertical'
type StackElement = 'div' | 'section' | 'nav' | 'ul' | 'ol' | 'li'
type StackMainAlignment = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
type StackCrossAlignment = 'start' | 'center' | 'end' | 'stretch'
type StackWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
type StackGap = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10
type StackSizeValue = number | string
type StackItemSize = 'static' | 'fill'
type StackItemCrossAlignSelf = 'start' | 'center' | 'end' | 'stretch'

export interface StackProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'style'> {
    /** Ref forwarded to the root element. */
    ref?: Ref<HTMLElement>
    /**
     * Direction of the stack layout.
     * @default "vertical"
     */
    direction?: StackDirection
    /**
     * Alignment along the main axis (`justify-content`): horizontal when `direction="horizontal"`,
     * vertical when `direction="vertical"`.
     */
    justify?: StackMainAlignment
    /**
     * Alignment along the cross axis (`align-items`): vertical when `direction="horizontal"`,
     * horizontal when `direction="vertical"`.
     */
    align?: StackCrossAlignment
    /** Spacing between items, as a step on the spacing scale. */
    gap?: StackGap
    /**
     * Whether items wrap onto multiple lines.
     * @default "nowrap"
     */
    wrap?: StackWrap
    /**
     * Enables scrollable overflow (`overflow: auto`).
     * @default false
     */
    isScrollable?: boolean
    /** Width of the stack. Numbers are treated as pixels. */
    width?: StackSizeValue
    /** Height of the stack. Numbers are treated as pixels. */
    height?: StackSizeValue
    /** Maximum width of the stack. Numbers are treated as pixels. */
    maxWidth?: StackSizeValue
    /** Minimum height of the stack. Numbers are treated as pixels. */
    minHeight?: StackSizeValue
    /**
     * The element type to render.
     * @default "div"
     */
    as?: StackElement
    /** Content to render inside the stack. */
    children?: ReactNode
}

function toCssSize(value: StackSizeValue | undefined) {
    return typeof value === 'number' ? `${value}px` : value
}

/**
 * Stack arranges items in a row or column with consistent spacing.
 *
 * @example
 * ```tsx
 * <Stack direction="horizontal" gap={2} align="center">
 *   <Button>Cancel</Button>
 *   <Button>Save</Button>
 * </Stack>
 * ```
 *
 * @summary Arranges items in a row or column with consistent spacing
 * @import import { Stack } from "@octoev/mosaic/Stack";
 */
export function Stack({
    direction = 'vertical',
    justify,
    align,
    gap,
    wrap,
    isScrollable,
    width,
    height,
    maxWidth,
    minHeight,
    as: element = 'div',
    children,
    ref,
    ...props
}: StackProps) {
    const style: CSSProperties & { '--stack-gap'?: string } = {
        width: toCssSize(width),
        height: toCssSize(height),
        maxWidth: toCssSize(maxWidth),
        minHeight: toCssSize(minHeight),
    }

    // The class is only added when set, so nested Stacks ignore an inherited `--stack-gap`.
    if (gap != null) {
        style['--stack-gap'] = `var(--mds-stack-spacing-${String(gap).replace('.', '-')})`
    }

    return createElement(
        element,
        {
            ...props,
            ref,
            className: cx(
                stackVariants({ direction, justify, align, wrap, isScrollable }),
                gap != null && styles.gap,
            ),
            style,
        },
        children,
    )
}

export interface StackItemProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'style'> {
    /** Ref forwarded to the root element. */
    ref?: Ref<HTMLElement>
    /**
     * Size behaviour of the item within the stack. `static` keeps its intrinsic size;
     * `fill` grows to fill the remaining space, shared evenly with other `fill` items.
     * @default "static"
     */
    size?: StackItemSize
    /** Overrides the parent stack's cross-axis alignment for this item. */
    crossAlignSelf?: StackItemCrossAlignSelf
    /**
     * Enables scrollable overflow (`overflow: auto`).
     * @default false
     */
    isScrollable?: boolean
    /**
     * The element type to render.
     * @default "div"
     */
    as?: StackElement
    /** Content to render inside the stack item. */
    children?: ReactNode
}

/**
 * StackItem controls how an individual child sizes and aligns itself within a `Stack`.
 *
 * @example
 * ```tsx
 * <Stack direction="horizontal" gap={2}>
 *   <StackItem>Logo</StackItem>
 *   <StackItem size="fill">Content</StackItem>
 *   <StackItem>Actions</StackItem>
 * </Stack>
 * ```
 *
 * @summary Controls the size and alignment of a single item in a Stack
 * @import import { StackItem } from "@octoev/mosaic/Stack";
 */
export function StackItem({
    size,
    crossAlignSelf,
    isScrollable,
    as: element = 'div',
    children,
    ref,
    ...props
}: StackItemProps) {
    return createElement(
        element,
        {
            ...props,
            ref,
            className: stackItemVariants({ size, crossAlignSelf, isScrollable }),
        },
        children,
    )
}

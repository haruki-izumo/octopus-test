import { ChevronDown } from '@octoev/mosaic-icons'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { ReactNode } from 'react'
import type {
    DisclosureGroupProps as AriaDisclosureGroupProps,
    DisclosurePanelProps as AriaDisclosurePanelProps,
    DisclosureProps as AriaDisclosureProps,
    HeadingProps as AriaHeadingProps,
} from 'react-aria-components'
import {
    Disclosure as AriaDisclosure,
    DisclosureGroup as AriaDisclosureGroup,
    DisclosurePanel as AriaDisclosurePanel,
    Button,
} from 'react-aria-components'

import styles from './Accordion.module.css'

const accordionVariants = cva(styles.base, {
    variants: {
        variant: {
            outline: styles.outline,
            filled: styles.filled,
        },
        size: {
            small: styles.small,
            default: null,
        },
    },
    compoundVariants: [
        {
            variant: 'filled',
            size: 'small',
            className: styles.filledSmall,
        },
    ],
    defaultVariants: {
        variant: 'outline',
        size: 'default',
    },
})

export interface AccordionProps
    extends AriaDisclosureGroupProps,
        VariantProps<typeof accordionVariants> {
    /** The visual style of the accordion.
     * @default "outline"
     */
    variant?: 'outline' | 'filled'
    /** The size of the accordion.
     * @default "default"
     */
    size?: 'small' | 'default'
    /** The accordion item elements in the accordion. */
    children: ReactNode
    /**
     * Whether multiple accordion items can be expanded at the same time.
     * @default false
     */
    allowsMultipleExpanded?: boolean
    /**
     * Whether all accordion items are disabled.
     * @default false
     */
    isDisabled?: boolean
}

/**
 * An accordion is a vertically stacked set of interactive headings that each contain a title, content snippet, or thumbnail representing a section of content. The headings function as controls that enable users to reveal or hide their associated sections of content. Accordions are commonly used to reduce the need to scroll when presenting multiple sections of content on a single page.
 *
 * @example
 * ```tsx
 * <Accordion>
 *   <AccordionItem>
 *     <AccordionTitle level={2}>Accordion title</AccordionTitle>
 *     <AccordionPanel>
 *       <p>
 *         Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque quis risus viverra arcu
 *         vehicula pretium. Curabitur a tincidunt nisl. Aliquam dui quam, convallis quis lacus eu,
 *         imperdiet tempus neque.
 *       </p>
 *     </AccordionPanel>
 *   </AccordionItem>
 * </Accordion>
 * ```
 *
 * @summary A vertically stacked set of interactive headings that each contain a title, content snippet, or thumbnail representing a section of content.
 * @import import { Accordion, AccordionItem, AccordionTitle, AccordionPanel } from "@octoev/mosaic/Accordion";
 */
export function Accordion({
    variant = 'outline',
    size = 'default',
    allowsMultipleExpanded,
    isDisabled,
    className,
    ...props
}: AccordionProps) {
    return (
        <AriaDisclosureGroup
            className={accordionVariants({
                variant,
                size,
                className,
            })}
            allowsMultipleExpanded={allowsMultipleExpanded}
            isDisabled={isDisabled}
            {...props}
        />
    )
}

export interface AccordionItemProps extends Omit<AriaDisclosureProps, 'className'> {
    /** The contents of the accordion item, consisting of an accordion item title and accordion item panel. */
    children: ReactNode
    /** An id for the accordion item, matching the id used in `expandedKeys`. */
    id?: string
    /**
     * Whether the accordion item is disabled
     * @default false
     */
    isDisabled?: boolean
    /**
     * Whether the accordion item is expanded (controlled)
     * @default false
     */
    isExpanded?: boolean
}

/**
 * An accordion item is a collapsible section of content. It is composed of a header with a heading
 * and trigger button, and a panel that contains the content.
 */
export function AccordionItem({ id, isDisabled, isExpanded, ...props }: AccordionItemProps) {
    return (
        <AriaDisclosure
            className={styles.item}
            id={id}
            isDisabled={isDisabled}
            isExpanded={isExpanded}
            {...props}
        />
    )
}

export interface AccordionHeaderProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
    /** The contents of the accordion item header. */
    children: ReactNode
}

/**
 * A wrapper element for the accordion item title that can contain other elements not part of the trigger.
 */
export function AccordionHeader({ children, ...props }: AccordionHeaderProps) {
    return (
        <div className={styles.header} {...props}>
            {children}
        </div>
    )
}

export interface AccordionTitleProps extends Omit<AriaHeadingProps, 'className' | 'level'> {
    /** The contents of the accordion item header. */
    children: ReactNode
    /**
     * The heading level.
     * @default 3
     */
    level?: 1 | 2 | 3 | 4 | 5 | 6
}

/**
 * An accordion item title consisting of a heading and a trigger button to expand/collapse the panel.
 */
export function AccordionTitle({ children, level = 3, ...props }: AccordionTitleProps) {
    const Heading = `h${level}` as const

    return (
        <Heading className={styles.title} {...props}>
            <Button slot="trigger" className={styles.button}>
                <span>{children}</span>
                <ChevronDown size={20} />
            </Button>
        </Heading>
    )
}

export interface AccordionPanelProps extends Omit<AriaDisclosurePanelProps, 'className'> {
    /** The contents of the accordion item panel. */
    children: ReactNode
}

/**
 * An accordion item panel is a collapsible section of content that is hidden until the accordion
 * item is expanded.
 */
export function AccordionPanel({ children, ...props }: AccordionPanelProps) {
    return (
        <AriaDisclosurePanel className={styles.panel} {...props}>
            <div>{children}</div>
        </AriaDisclosurePanel>
    )
}

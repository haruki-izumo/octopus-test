import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonProps as AriaButtonProps } from 'react-aria-components'
import { Button as AriaButton } from 'react-aria-components'

import styles from './Button.module.css'

const buttonVariants = cva(styles.base, {
    variants: {
        variant: {
            primary: styles.primary,
            secondary: styles.secondary,
            tertiary: styles.tertiary,
            positive: styles.positive,
            danger: styles.danger,
        },
        fillStyle: {
            fill: styles.fill,
            outline: styles.outline,
            ghost: styles.ghost,
        },
        size: {
            small: styles.small,
            medium: styles.medium,
            large: styles.large,
        },
    },
    compoundVariants: [
        {
            variant: 'primary',
            fillStyle: 'outline',
            className: styles.primaryOutline,
        },
        {
            variant: 'secondary',
            fillStyle: 'outline',
            className: styles.secondaryOutline,
        },
        {
            variant: 'tertiary',
            fillStyle: 'outline',
            className: styles.tertiaryOutline,
        },
        {
            variant: 'positive',
            fillStyle: 'outline',
            className: styles.positiveOutline,
        },
        {
            variant: 'danger',
            fillStyle: 'outline',
            className: styles.dangerOutline,
        },
        { variant: 'primary', fillStyle: 'ghost', className: styles.primaryGhost },
        {
            variant: 'secondary',
            fillStyle: 'ghost',
            className: styles.secondaryGhost,
        },
        {
            variant: 'tertiary',
            fillStyle: 'ghost',
            className: styles.tertiaryGhost,
        },
        {
            variant: 'positive',
            fillStyle: 'ghost',
            className: styles.positiveGhost,
        },
        { variant: 'danger', fillStyle: 'ghost', className: styles.dangerGhost },
    ],
    defaultVariants: {
        variant: 'primary',
        fillStyle: 'fill',
        size: 'medium',
    },
})

export interface ButtonProps extends AriaButtonProps, VariantProps<typeof buttonVariants> {
    /** The visual style of the button.
     * @default "primary"
     */
    variant?: 'primary' | 'secondary' | 'tertiary' | 'positive' | 'danger'
    /** The fill style of the button.
     * @default "fill"
     */
    fillStyle?: 'fill' | 'outline' | 'ghost'
    /** The size of the button.
     * @default "medium"
     */
    size?: 'small' | 'medium' | 'large'
}

/**
 * Button triggers an action when clicked. Use it for form submissions, confirmations, navigation, or any interaction that needs a clear call to action
 * @example
 * ```tsx
 * <Button>Label</Button>
 * ```
 *
 * @summary A button allows a user to perform an action
 * @import import { Button } from "@octoev/mosaic/Button";
 */
export function Button({ variant, fillStyle, size, className, children, ...props }: ButtonProps) {
    return (
        <AriaButton
            className={buttonVariants({
                variant,
                fillStyle,
                size,
                className,
            })}
            {...props}
        >
            {children}
        </AriaButton>
    )
}

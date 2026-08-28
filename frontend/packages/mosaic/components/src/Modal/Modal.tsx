import { cva, type VariantProps } from 'class-variance-authority'
import type {
    DialogProps as AriaDialogProps,
    DialogTriggerProps as AriaDialogTriggerProps,
    ModalOverlayProps as AriaModalOverlayProps,
} from 'react-aria-components'
import {
    Dialog as AriaDialog,
    DialogTrigger as AriaDialogTrigger,
    Modal as AriaModal,
    ModalOverlay as AriaModalOverlay,
} from 'react-aria-components'

import styles from './Modal.module.css'

const modalVariants = cva(styles.modal, {
    variants: {
        size: {
            sm: styles.sm,
            md: styles.md,
            lg: styles.lg,
            xl: styles.xl,
        },
    },
    defaultVariants: {
        size: 'md',
    },
})

export interface DialogTriggerProps extends AriaDialogTriggerProps {}

/**
 * The trigger component for the modal. It wraps the element that will open the modal when interacted with
 */
export function DialogTrigger({ ...props }: DialogTriggerProps) {
    return <AriaDialogTrigger {...props} />
}

export interface ModalOverlayProps extends Omit<AriaModalOverlayProps, 'className'> {}

/**
 * The overlay component for the modal. It provides a backdrop and handles closing the modal when clicking outside of it
 */
export function ModalOverlay({ ...props }: ModalOverlayProps) {
    return <AriaModalOverlay className={styles.overlay} {...props} />
}

export interface ModalProps
    extends Omit<AriaModalOverlayProps, 'className'>,
        VariantProps<typeof modalVariants> {
    /**
     * The size of the modal. Determines the width and padding based on predefined size variants
     * @default "md"
     */
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * A modal dialog that overlays the main content. It can be used to display important information or prompt the user for input. The size of the modal can be adjusted using the `size` prop.
 *
 * @example
 * ```tsx
 * <DialogTrigger>
 *   <Button>Open Modal</Button>
 *   <ModalOverlay>
 *     <Modal>
 *       <Dialog>
 *         <h4>Modal heading</h4>
 *         <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dolor mi, interdum eget pharetra a, interdum ut tortor. Mauris eu bibendum dui. Suspendisse congue hendrerit pellentesque.</p>
 *         <Button slot="close">Close</Button>
 *       </Dialog>
 *     </Modal>
 *   </ModalOverlay>
 * </DialogTrigger>
 * ```
 *
 * @summary A modal displays focused content and actions in an overlay
 * @import import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@octoev/mosaic/Modal";
 */
export function Modal({ size, ...props }: ModalProps) {
    return <AriaModal className={modalVariants({ size })} {...props} />
}

export interface DialogProps extends Omit<AriaDialogProps, 'className'> {}

/**
 * The dialog component for the modal. It represents the content area of the modal where information and actions are displayed.
 */
export function Dialog({ ...props }: DialogProps) {
    return <AriaDialog className={styles.dialog} {...props} />
}

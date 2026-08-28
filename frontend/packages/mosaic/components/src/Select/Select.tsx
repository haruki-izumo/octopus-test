import { ChevronDown } from '@octoev/mosaic-icons'
import type React from 'react'
import type {
    ListBoxItemProps as AriaListBoxItemProps,
    ListBoxProps as AriaListBoxProps,
    SelectProps as AriaSelectProps,
    ValidationResult,
} from 'react-aria-components'
import {
    Button as AriaButton,
    ListBox as AriaListBox,
    ListBoxItem as AriaListBoxItem,
    Popover as AriaPopover,
    Select as AriaSelect,
    SelectValue as AriaSelectValue,
} from 'react-aria-components'

import { Description } from '../Description'
import { FieldError } from '../FieldError'
import { Label } from '../Label'

import styles from './Select.module.css'

export interface SelectProps<T extends object>
    extends Omit<AriaSelectProps<T>, 'children' | 'className'> {
    /** Label text for the select component */
    label?: string
    /** Description text displayed below the select component */
    description?: string
    /** The error message for the select component */
    errorMessage?: string | ((validation: ValidationResult) => string)
    /** The children of the select component, typically `SelectItem` components */
    children: React.ReactNode | ((item: T) => React.ReactNode)
    /** The items to be displayed in the select dropdown */
    items?: Iterable<T>
}

/**
 * A select displays a collapsible list of options and allows a user to select one of them
 *
 * @example
 * ```tsx
 * <Select label="Sort cars by" placeholder="Sort order">
 *   <SelectItem id="price-low-high">Price: Low – High</SelectItem>
 *   <SelectItem id="price-high-low">Price: High – Low</SelectItem>
 * </Select>
 * ```
 *
 * @summary A dropdown select component
 * @import import { Select, SelectItem } from "@octoev/mosaic/Select";
 */
export function Select<T extends object>({
    label,
    description,
    errorMessage,
    children,
    items,
    validationBehavior = 'aria',
    ...props
}: SelectProps<T>) {
    return (
        <AriaSelect className={styles.select} validationBehavior={validationBehavior} {...props}>
            {({ isInvalid }) => (
                <>
                    {label && <Label>{label}</Label>}
                    <AriaButton className={styles.trigger}>
                        <AriaSelectValue className={styles.value} />
                        <ChevronDown aria-hidden="true" className={styles.icon} />
                    </AriaButton>
                    {description && <Description>{description}</Description>}
                    <FieldError>{errorMessage}</FieldError>
                    <AriaPopover
                        className={
                            isInvalid
                                ? `${styles.popover} ${styles.popoverInvalid}`
                                : styles.popover
                        }
                    >
                        <SelectListBox items={items}>{children}</SelectListBox>
                    </AriaPopover>
                </>
            )}
        </AriaSelect>
    )
}

/**
 * The ListBox component used internally by the Select component to display a list of options and allow a user to select one or more of them
 *
 * @example
 * ```tsx
 * <SelectListBox items={[{ id: "1", name: "Option 1" }, { id: "2", name: "Option 2" }]}>
 *   {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
 * </SelectListBox>
 * ```
 *
 * @summary A listbox displays a list of options
 * @import import { SelectListBox } from "@octoev/mosaic/Select";
 */
export function SelectListBox<T extends object>(props: AriaListBoxProps<T>) {
    return <AriaListBox {...props} className={styles.listBox} />
}

/**
 * The ListBoxItem component used internally by the Select component to represent an individual option in a ListBox
 *
 * @example
 * ```tsx
 * <SelectItem id={item.id}>{item.name}</SelectItem>
 * ```
 *
 * @summary A listbox item represents an option within a listbox
 * @import import { SelectItem } from "@octoev/mosaic/Select";
 */
export function SelectItem(props: AriaListBoxItemProps) {
    return <AriaListBoxItem {...props} className={styles.item} />
}

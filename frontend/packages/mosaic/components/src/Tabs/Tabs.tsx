import { cva, type VariantProps } from 'class-variance-authority'
import type {
    TabListProps as AriaTabListProps,
    TabPanelProps as AriaTabPanelProps,
    TabProps as AriaTabProps,
    TabsProps as AriaTabsProps,
} from 'react-aria-components'
import {
    Tab as AriaTab,
    TabList as AriaTabList,
    TabPanel as AriaTabPanel,
    Tabs as AriaTabs,
} from 'react-aria-components'

import styles from './Tabs.module.css'

const tabsVariants = cva(styles.tabs, {
    variants: {
        size: {
            small: styles.small,
            medium: styles.medium,
        },
    },
    defaultVariants: {
        size: 'medium',
    },
})

export interface TabsProps
    extends Omit<AriaTabsProps, 'className'>,
        VariantProps<typeof tabsVariants> {
    /**
     * The size of the tab list.
     * @default "medium"
     */
    size?: 'small' | 'medium'
}

/**
 * Tabs provide a tab-style navigation for organizing content into categorised sections. Use it to let users switch between related views without leaving the page
 *
 * @example
 * ```tsx
 * <Tabs>
 *   <TabList aria-label="Project sections">
 *     <Tab id="overview">Overview</Tab>
 *     <Tab id="activity">Activity</Tab>
 *     <Tab id="settings">Settings</Tab>
 *   </TabList>
 *   <TabPanel id="overview">Overview content for the currently selected project.</TabPanel>
 *   <TabPanel id="activity">Activity feed content with recent updates.</TabPanel>
 *   <TabPanel id="settings">Settings content for preferences and configuration.</TabPanel>
 * </Tabs>
 * ```
 *
 * @summary Tabs organize content into multiple sections and allow users to navigate between them
 * @import import { Tabs, TabList, Tab, TabPanel } from "@octoev/mosaic/Tabs";
 */
export function Tabs({ size, ...props }: TabsProps) {
    return (
        <AriaTabs
            className={tabsVariants({
                size,
            })}
            {...props}
        />
    )
}

export interface TabListProps<T extends object> extends Omit<AriaTabListProps<T>, 'className'> {}

/**
 * A TabList is used within Tabs to group tabs that a user can switch between. The ids of the items within the <TabList> must match up with a corresponding item inside the <TabPanels> component
 */
export function TabList<T extends object>({ ...props }: TabListProps<T>) {
    return <AriaTabList className={styles.tabList} {...props} />
}

export interface TabProps extends Omit<AriaTabProps, 'className'> {}

/**
 * A Tab provides a title for an individual item within a TabList.
 */
export function Tab({ ...props }: TabProps) {
    return <AriaTab className={styles.tab} {...props} />
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'className'> {}

/**
 * A TabPanel provides the content for a tab
 */
export function TabPanel({ ...props }: TabPanelProps) {
    return <AriaTabPanel className={styles.tabPanel} {...props} />
}

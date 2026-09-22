import { LayoutDashboard } from '@octoev/mosaic-icons'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@octoev/mosaic/reset.css'
import '@octoev/mosaic/typography.css'
import '@octoev/mosaic-tokens/octopus/dark'
import './globals.css'

import styles from './layout.module.css'

export const metadata: Metadata = {
    title: 'Service Tool | Octopus Electric Vehicles',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" data-theme="octopus-dark">
            <head>
                <link
                    rel="stylesheet"
                    href="https://static.octopuscdn.com/fonts/Chromatophore/fonts.min.css"
                />
            </head>
            <body>
                <header className={styles.header}>
                    <div className={styles.headerInner}>
                        <LayoutDashboard aria-hidden className={styles.brandIcon} />
                        <span className={styles.brand}>Service tool</span>
                    </div>
                </header>
                <main className={styles.main}>{children}</main>
            </body>
        </html>
    )
}

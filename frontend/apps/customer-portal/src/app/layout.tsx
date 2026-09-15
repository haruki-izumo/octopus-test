import { Car } from '@octoev/mosaic-icons'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@octoev/mosaic/reset.css'
import '@octoev/mosaic/typography.css'
import '@octoev/mosaic-tokens/octopus/light'
import '@octoev/mosaic-tokens/octopus/dark'
import './globals.css'

import styles from './layout.module.css'

export const metadata: Metadata = {
    title: 'Customer Portal | Octopus Electric Vehicles',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" data-theme="octopus-light">
            <head>
                <link
                    rel="stylesheet"
                    href="https://static.octopuscdn.com/fonts/Chromatophore/fonts.min.css"
                />
            </head>
            <body>
                <header className={styles.header}>
                    <div className={styles.headerInner}>
                        <Car aria-hidden className={styles.brandIcon} />
                        <span className={styles.brand}>Customer portal</span>
                    </div>
                </header>
                <main className={styles.main}>{children}</main>
            </body>
        </html>
    )
}

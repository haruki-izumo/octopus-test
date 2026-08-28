import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@octoev/mosaic/reset.css'
import '@octoev/mosaic/typography.css'
import '@octoev/mosaic-tokens/octopus/light'

export const metadata: Metadata = {
    title: 'Customer Portal',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" data-theme="octopus-light">
            <body>{children}</body>
        </html>
    )
}

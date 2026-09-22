import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import HomePage from './page'

vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
        throw new Error(`Redirect to ${url}`)
    },
}))

const UUID = '6f1c2c1e-5d0b-4a39-9a55-0d5b1c7f8a01'

async function renderPage(uuid?: string) {
    render(await HomePage({ searchParams: Promise.resolve({ uuid }) }))
}

describe('HomePage', () => {
    it('asks for a contract UUID', async () => {
        await renderPage()

        expect(screen.getByRole('textbox', { name: 'Contract UUID' })).toHaveValue('')
        expect(screen.queryByText(/Enter a UUID/)).toBeNull()
    })

    it.each([UUID, ` ${UUID.toUpperCase()} `])('opens the contract for %j', async (uuid) => {
        await expect(renderPage(uuid)).rejects.toThrow(`Redirect to /contracts/${UUID}`)
    })

    it('explains what to enter when it is not a UUID', async () => {
        await renderPage('LC25 KTA')

        expect(screen.getByRole('textbox', { name: 'Contract UUID' })).toHaveValue('LC25 KTA')
        expect(screen.getByText(/Enter a UUID/)).toBeInTheDocument()
    })
})

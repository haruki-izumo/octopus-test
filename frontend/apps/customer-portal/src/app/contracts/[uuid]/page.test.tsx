import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import type { Contract } from '@/lib/contracts'

import ContractPage from './page'

vi.mock('next/navigation', () => ({
    notFound: () => {
        throw new Error('Not found')
    },
}))

const CONTRACT: Contract = {
    uuid: '6f1c2c1e-5d0b-4a39-9a55-0d5b1c7f8a01',
    customer_uuid: '0b7e4a52-3f7d-4b8e-8d1a-2c9f6e5a4b31',
    status: 'ACTIVE',
    vehicle: { make: 'Kia', model: 'EV6', registration: 'LC25 A01' },
    start_date: '2025-09-01',
    end_date: '2028-08-31',
    term_months: 36,
    annual_mileage: 10000,
    monthly_payment: '765.56',
    billing_day: 1,
    months_remaining: 23,
}

describe('ContractPage', () => {
    let fetchMock: Mock<typeof fetch>

    beforeEach(() => {
        fetchMock = vi.fn<typeof fetch>()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    async function renderPage(contract: Contract = CONTRACT) {
        fetchMock.mockResolvedValue(Response.json(contract))
        render(await ContractPage({ params: Promise.resolve({ uuid: contract.uuid }) }))
    }

    it('shows the contract', async () => {
        await renderPage()

        expect(screen.getByRole('heading', { name: 'Kia EV6' })).toBeInTheDocument()
        expect(screen.getByText('£765.56')).toBeInTheDocument()
        expect(screen.getByText('The 1st of each month')).toBeInTheDocument()
        expect(screen.getByText('10,000 miles')).toBeInTheDocument()
        expect(screen.getByText('36 months, 23 remaining')).toBeInTheDocument()
        expect(screen.getByText('1 September 2025')).toBeInTheDocument()
        expect(screen.getByText('31 August 2028')).toBeInTheDocument()
        expect(fetchMock).toHaveBeenCalledWith(`/api/contracts/${CONTRACT.uuid}`, {
            cache: 'no-store',
        })
    })

    it('links to changing the payment date', async () => {
        await renderPage()

        expect(screen.getByRole('link', { name: 'Change my payment date' })).toHaveAttribute(
            'href',
            `/contracts/${CONTRACT.uuid}/billing-day`,
        )
    })

    it.each(['PENDING_VARIATION', 'TERMINATED'] as const)(
        'does not offer changes when the contract is %s',
        async (status) => {
            await renderPage({ ...CONTRACT, status })

            expect(screen.queryByRole('link', { name: 'Change my payment date' })).toBeNull()
        },
    )

    it('shows the not found page for an unknown contract', async () => {
        fetchMock.mockResolvedValue(
            Response.json(
                { error: { code: 'NOT_FOUND', message: 'Contract not found' } },
                { status: 404 },
            ),
        )

        await expect(
            ContractPage({ params: Promise.resolve({ uuid: CONTRACT.uuid }) }),
        ).rejects.toThrow('Not found')
    })
})

import { render, screen, within } from '@testing-library/react'
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
    status: 'PENDING_VARIATION',
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

    function detail(section: string, term: string): string | null {
        const region = screen.getByRole('region', { name: section })
        return (
            within(region).getByText(term, { selector: 'dt' }).nextElementSibling?.textContent ??
            null
        )
    }

    it('shows every detail of the contract', async () => {
        await renderPage()

        expect(screen.getByRole('heading', { level: 1, name: 'Kia EV6' })).toBeInTheDocument()
        expect(detail('Metadata', 'Contract UUID')).toBe(CONTRACT.uuid)
        expect(detail('Metadata', 'Customer UUID')).toBe(CONTRACT.customer_uuid)
        expect(detail('Metadata', 'Status')).toBe('Pending variation')
        expect(detail('Payment', 'Monthly payment')).toBe('£765.56')
        expect(detail('Payment', 'Billing day')).toBe('1st of each month')
        expect(detail('Lease details', 'Start date')).toBe('1 September 2025')
        expect(detail('Lease details', 'End date')).toBe('31 August 2028')
        expect(detail('Lease details', 'Term')).toBe('36 months (23 remaining)')
        expect(detail('Lease details', 'Annual mileage')).toBe('10,000 miles')
        expect(detail('Vehicle', 'Make')).toBe('Kia')
        expect(detail('Vehicle', 'Model')).toBe('EV6')
        expect(detail('Vehicle', 'Registration')).toBe('LC25 A01')
        expect(fetchMock).toHaveBeenCalledWith(`http://localhost:8080/contracts/${CONTRACT.uuid}`, {
            cache: 'no-store',
        })
    })

    it('shows where the contract sits in the breadcrumbs', async () => {
        await renderPage()

        const breadcrumbs = screen.getByRole('list', { name: 'Breadcrumbs' })
        expect(within(breadcrumbs).getByRole('link', { name: 'Contracts' })).toHaveAttribute(
            'href',
            '/',
        )
        expect(
            within(breadcrumbs).getByText(CONTRACT.uuid).closest('[aria-current]'),
        ).toHaveAttribute('aria-current', 'page')
    })

    it('lists the sections and details in order', async () => {
        await renderPage()

        const terms = (section: string) =>
            within(screen.getByRole('region', { name: section }))
                .getAllByRole('term')
                .map((term) => term.textContent)

        expect(
            screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
        ).toEqual(['Lease details', 'Vehicle', 'Payment', 'Metadata'])
        expect(terms('Lease details')).toEqual(['Annual mileage', 'Term', 'Start date', 'End date'])
        expect(terms('Metadata')).toEqual(['Status', 'Contract UUID', 'Customer UUID'])
    })

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

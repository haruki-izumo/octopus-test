import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import type { Contract } from '@/lib/contracts'

import { BillingDayChangeForm } from './BillingDayChangeForm'

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh }),
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

const CHANGE = {
    uuid: '9a0e8c4d-1b2f-4e3a-8c5d-6f7e8a9b0c1d',
    contract_uuid: CONTRACT.uuid,
    previous_billing_day: 1,
    new_billing_day: 15,
    effective_from: '2026-10-01',
}

function errorResponse(status: number, code: string, message: string): Response {
    return Response.json({ error: { code, message } }, { status })
}

describe('BillingDayChangeForm', () => {
    let fetchMock: Mock<typeof fetch>

    beforeEach(() => {
        fetchMock = vi.fn<typeof fetch>()
        vi.stubGlobal('fetch', fetchMock)
        refresh.mockClear()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    function sentIdempotencyKeys(): (string | null)[] {
        return fetchMock.mock.calls.map(([, init]) =>
            new Headers(init?.headers).get('Idempotency-Key'),
        )
    }

    async function chooseDayAndSubmit(user: ReturnType<typeof userEvent.setup>, day: string) {
        await user.click(screen.getByRole('button', { name: /New payment date/ }))
        await user.click(screen.getByRole('option', { name: day }))
        await user.click(screen.getByRole('button', { name: 'Change my payment date' }))
    }

    it('shows the current payment', () => {
        render(<BillingDayChangeForm contract={CONTRACT} />)

        expect(
            screen.getByText('Your monthly payment of £765.56 is taken on the 1st of each month.'),
        ).toBeInTheDocument()
    })

    it('does not offer the current billing day', async () => {
        const user = userEvent.setup()
        render(<BillingDayChangeForm contract={CONTRACT} />)

        await user.click(screen.getByRole('button', { name: /New payment date/ }))

        expect(screen.queryByRole('option', { name: '1st' })).toBeNull()
        expect(screen.getAllByRole('option')).toHaveLength(27)
    })

    it('changes the billing day and shows when it takes effect', async () => {
        const user = userEvent.setup()
        fetchMock.mockResolvedValue(Response.json(CHANGE, { status: 201 }))
        render(<BillingDayChangeForm contract={CONTRACT} />)

        await chooseDayAndSubmit(user, '15th')

        expect(
            await screen.findByText('Your payment date is changing to the 15th'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Your next payment will still be taken on 1 October 2026/),
        ).toBeInTheDocument()
        expect(fetchMock).toHaveBeenCalledOnce()
        expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
            JSON.stringify({ contract_uuid: CONTRACT.uuid, billing_day: 15 }),
        )
        expect(sentIdempotencyKeys()[0]).toMatch(/^[0-9a-f-]{36}$/)
    })

    it('uses the same idempotency key when the customer tries again', async () => {
        const user = userEvent.setup()
        fetchMock
            .mockResolvedValueOnce(new Response(null, { status: 503 }))
            .mockResolvedValueOnce(new Response(null, { status: 503 }))
            .mockResolvedValueOnce(new Response(null, { status: 503 }))
            .mockResolvedValueOnce(Response.json(CHANGE, { status: 201 }))
        render(<BillingDayChangeForm contract={CONTRACT} />)

        await chooseDayAndSubmit(user, '15th')
        expect(
            await screen.findByText('Something went wrong. Please try again.'),
        ).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Change my payment date' }))

        expect(
            await screen.findByText('Your payment date is changing to the 15th'),
        ).toBeInTheDocument()
        const keys = sentIdempotencyKeys()
        expect(keys).toHaveLength(4)
        expect(new Set(keys).size).toBe(1)
    })

    it('reloads the contract when it changed at the same time', async () => {
        const user = userEvent.setup()
        fetchMock.mockResolvedValue(
            errorResponse(
                409,
                'CONFLICT',
                `Contract ${CONTRACT.uuid} was changed by another request`,
            ),
        )
        render(<BillingDayChangeForm contract={CONTRACT} />)

        await chooseDayAndSubmit(user, '15th')

        expect(
            await screen.findByText(/Your contract changed while you were on this page/),
        ).toBeInTheDocument()
        expect(refresh).toHaveBeenCalledOnce()
        expect(screen.queryByText(/is changing to/)).toBeNull()
    })

    it('shows why a change is not allowed', async () => {
        const user = userEvent.setup()
        fetchMock.mockResolvedValue(
            errorResponse(
                422,
                'BUSINESS_RULE_BROKEN',
                "The billing day can't be changed within 30 days of the contract's end date",
            ),
        )
        render(<BillingDayChangeForm contract={CONTRACT} />)

        await chooseDayAndSubmit(user, '15th')

        expect(
            await screen.findByText(
                "The billing day can't be changed within 30 days of the contract's end date",
            ),
        ).toBeInTheDocument()
        expect(refresh).not.toHaveBeenCalled()
    })

    it('shows a general error for an unexpected response', async () => {
        const user = userEvent.setup()
        fetchMock.mockResolvedValue(errorResponse(400, 'BAD_REQUEST', 'Bad request'))
        render(<BillingDayChangeForm contract={CONTRACT} />)

        await chooseDayAndSubmit(user, '15th')

        expect(
            await screen.findByText('Something went wrong. Please try again.'),
        ).toBeInTheDocument()
        expect(fetchMock).toHaveBeenCalledOnce()
    })
})

import { notFound } from 'next/navigation'

import { ApiError, getJson } from '@/lib/api-client'

export type ContractStatus = 'ACTIVE' | 'PENDING_VARIATION' | 'TERMINATED'

/** The response from `GET /contracts/{uuid}`. Amounts are in pounds and dates are ISO dates. */
export interface Contract {
    uuid: string
    customer_uuid: string
    status: ContractStatus
    vehicle: { make: string; model: string; registration: string }
    start_date: string
    end_date: string
    term_months: number
    annual_mileage: number
    monthly_payment: string
    billing_day: number
    months_remaining: number
}

export async function getContract(uuid: string, init?: RequestInit): Promise<Contract> {
    try {
        return await getJson<Contract>(`/contracts/${encodeURIComponent(uuid)}`, init)
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            notFound()
        }
        throw error
    }
}

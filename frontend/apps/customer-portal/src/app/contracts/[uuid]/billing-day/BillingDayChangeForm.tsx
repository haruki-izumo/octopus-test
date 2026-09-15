'use client'

import { Alert } from '@octoev/mosaic/Alert'
import { Button } from '@octoev/mosaic/Button'
import { Link } from '@octoev/mosaic/Link'
import { Select, SelectItem } from '@octoev/mosaic/Select'
import { Stack } from '@octoev/mosaic/Stack'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ApiError, createActionKey, postJson } from '@/lib/api-client'
import type { Contract } from '@/lib/contracts'
import { formatUkDate } from '@/lib/dates'
import { formatPounds } from '@/lib/money'
import { ordinal } from '@/lib/ordinal'

interface BillingDayChange {
    uuid: string
    contract_uuid: string
    previous_billing_day: number
    new_billing_day: number
    effective_from: string
}

const BILLING_DAYS = Array.from({ length: 28 }, (_, index) => index + 1)

export function BillingDayChangeForm({ contract }: { contract: Contract }) {
    const router = useRouter()
    const [actionKey] = useState(createActionKey)
    const [billingDay, setBillingDay] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [change, setChange] = useState<BillingDayChange | null>(null)

    async function submit() {
        if (billingDay === null) {
            return
        }
        setIsSubmitting(true)
        setError(null)
        try {
            setChange(
                await postJson<BillingDayChange>(
                    '/billing-day-changes',
                    { contract_uuid: contract.uuid, billing_day: billingDay },
                    { actionKey },
                ),
            )
        } catch (caught) {
            if (caught instanceof ApiError && caught.status === 409) {
                setError(
                    'Your contract changed while you were on this page. We’ve loaded the latest ' +
                        'details, so please check them and try again.',
                )
                router.refresh()
            } else if (caught instanceof ApiError && caught.code === 'BUSINESS_RULE_BROKEN') {
                setError(caught.message)
            } else {
                setError('Something went wrong. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (change) {
        return (
            <Stack gap={4}>
                <Alert
                    variant="success"
                    title={`Your payment date is changing to the ${ordinal(change.new_billing_day)}`}
                    announce="polite"
                />
                <p>
                    Your next payment will still be taken on {formatUkDate(change.effective_from)}.
                    After that, payments will be taken on the {ordinal(change.new_billing_day)} of
                    each month.
                </p>
                <Link href={`/contracts/${contract.uuid}`}>Back to your contract</Link>
            </Stack>
        )
    }

    return (
        <Stack gap={4}>
            <h1>Change your payment date</h1>
            <p>
                Your monthly payment of {formatPounds(contract.monthly_payment)} is taken on the{' '}
                {ordinal(contract.billing_day)} of each month.
            </p>
            {error && <Alert variant="danger" title={error} announce="assertive" />}
            <Select
                label="New payment date"
                placeholder="Choose a day"
                value={billingDay}
                onChange={(key) => setBillingDay(Number(key))}
            >
                {BILLING_DAYS.filter((day) => day !== contract.billing_day).map((day) => (
                    <SelectItem key={day} id={day}>
                        {ordinal(day)}
                    </SelectItem>
                ))}
            </Select>
            <Stack direction="horizontal" gap={4} align="center" wrap="wrap">
                <Button isDisabled={billingDay === null} isPending={isSubmitting} onPress={submit}>
                    Change my payment date
                </Button>
                <Link href={`/contracts/${contract.uuid}`}>Cancel</Link>
            </Stack>
        </Stack>
    )
}

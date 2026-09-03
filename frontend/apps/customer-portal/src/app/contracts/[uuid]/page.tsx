import { Box } from '@octoev/mosaic/Box'
import { Link } from '@octoev/mosaic/Link'
import { Stack } from '@octoev/mosaic/Stack'

import { type ContractStatus, getContract } from '@/lib/contracts'
import { formatUkDate } from '@/lib/dates'
import { formatPounds } from '@/lib/money'
import { ordinal } from '@/lib/ordinal'

const STATUS_LABELS: Record<ContractStatus, string> = {
    ACTIVE: 'Active',
    PENDING_VARIATION: 'Waiting for you to accept a change',
    TERMINATED: 'Ended',
}

export default async function ContractPage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params
    const contract = await getContract(uuid, { cache: 'no-store' })

    return (
        <Box as="div" p={6} maxWidth={640}>
            <Stack gap={4}>
                <Stack gap={1}>
                    <h1>
                        {contract.vehicle.make} {contract.vehicle.model}
                    </h1>
                    <p>{contract.vehicle.registration}</p>
                </Stack>

                <dl>
                    <dt>Status</dt>
                    <dd>{STATUS_LABELS[contract.status]}</dd>
                    <dt>Monthly payment</dt>
                    <dd>{formatPounds(contract.monthly_payment)}</dd>
                    <dt>Payment date</dt>
                    <dd>The {ordinal(contract.billing_day)} of each month</dd>
                    <dt>Annual mileage</dt>
                    <dd>{contract.annual_mileage.toLocaleString('en-GB')} miles</dd>
                    <dt>Term</dt>
                    <dd>
                        {contract.term_months} months, {contract.months_remaining} remaining
                    </dd>
                    <dt>Start date</dt>
                    <dd>{formatUkDate(contract.start_date)}</dd>
                    <dt>End date</dt>
                    <dd>{formatUkDate(contract.end_date)}</dd>
                </dl>

                {contract.status === 'ACTIVE' && (
                    <Link href={`/contracts/${contract.uuid}/billing-day`}>
                        Change my payment date
                    </Link>
                )}
            </Stack>
        </Box>
    )
}

import { Box } from '@octoev/mosaic/Box'
import { Breadcrumb, Breadcrumbs } from '@octoev/mosaic/Breadcrumbs'
import { Stack } from '@octoev/mosaic/Stack'

import { getContract } from '@/lib/contracts'

import { BillingDayChangeForm } from './BillingDayChangeForm'

export default async function BillingDayPage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params
    const contract = await getContract(uuid, { cache: 'no-store' })

    return (
        <Stack gap={6}>
            <nav>
                <Breadcrumbs>
                    <Breadcrumb href="/">Home</Breadcrumb>
                    <Breadcrumb href={`/contracts/${contract.uuid}`}>
                        {contract.vehicle.make} {contract.vehicle.model}
                    </Breadcrumb>
                    <Breadcrumb>Payment date</Breadcrumb>
                </Breadcrumbs>
            </nav>
            <Box as="div" maxWidth={640}>
                <BillingDayChangeForm contract={contract} />
            </Box>
        </Stack>
    )
}

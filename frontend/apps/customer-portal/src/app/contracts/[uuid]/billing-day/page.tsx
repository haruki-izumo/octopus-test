import { Box } from '@octoev/mosaic/Box'

import { getContract } from '@/lib/contracts'

import { BillingDayChangeForm } from './BillingDayChangeForm'

export default async function BillingDayPage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params
    const contract = await getContract(uuid, { cache: 'no-store' })

    return (
        <Box as="div" p={6} maxWidth={640}>
            <BillingDayChangeForm contract={contract} />
        </Box>
    )
}

import { Breadcrumb, Breadcrumbs } from '@octoev/mosaic/Breadcrumbs'
import { Divider } from '@octoev/mosaic/Divider'
import { Stack } from '@octoev/mosaic/Stack'
import type { ReactNode } from 'react'
import { useId } from 'react'

import { type ContractStatus, getContract } from '@/lib/contracts'
import { formatUkDate } from '@/lib/dates'
import { formatPounds } from '@/lib/money'
import { ordinal } from '@/lib/ordinal'

import styles from './page.module.css'

const STATUS_LABELS: Record<ContractStatus, string> = {
    ACTIVE: 'Active',
    PENDING_VARIATION: 'Pending variation',
    TERMINATED: 'Terminated',
}

export default async function ContractPage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params
    const contract = await getContract(uuid, { cache: 'no-store' })
    const vehicle = `${contract.vehicle.make} ${contract.vehicle.model}`

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <nav>
                    <Breadcrumbs>
                        <Breadcrumb href="/">Contracts</Breadcrumb>
                        <Breadcrumb>
                            <code>{contract.uuid}</code>
                        </Breadcrumb>
                    </Breadcrumbs>
                </nav>
                <Stack direction="horizontal" align="center" gap={4} wrap="wrap">
                    <h1>{vehicle}</h1>
                    <span className={styles.registration}>{contract.vehicle.registration}</span>
                </Stack>
            </header>

            <Divider />

            <div className={styles.sections}>
                <Section title="Lease details">
                    <Detail term="Annual mileage">
                        {contract.annual_mileage.toLocaleString('en-GB')} miles
                    </Detail>
                    <Detail term="Term">
                        {contract.term_months} months ({contract.months_remaining} remaining)
                    </Detail>
                    <Detail term="Start date">{formatUkDate(contract.start_date)}</Detail>
                    <Detail term="End date">{formatUkDate(contract.end_date)}</Detail>
                </Section>

                <Section title="Vehicle">
                    <Detail term="Make">{contract.vehicle.make}</Detail>
                    <Detail term="Model">{contract.vehicle.model}</Detail>
                    <Detail term="Registration">{contract.vehicle.registration}</Detail>
                </Section>

                <Section title="Payment">
                    <Detail term="Monthly payment">{formatPounds(contract.monthly_payment)}</Detail>
                    <Detail term="Billing day">
                        {ordinal(contract.billing_day)} of each month
                    </Detail>
                </Section>

                <Section title="Metadata">
                    <Detail term="Status">{STATUS_LABELS[contract.status]}</Detail>
                    <Detail term="Contract UUID">
                        <code className={styles.identifier}>{contract.uuid}</code>
                    </Detail>
                    <Detail term="Customer UUID">
                        <code className={styles.identifier}>{contract.customer_uuid}</code>
                    </Detail>
                </Section>
            </div>
        </div>
    )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    const headingId = useId()
    return (
        <section className={styles.section} aria-labelledby={headingId}>
            <h2 id={headingId}>{title}</h2>
            <dl className={styles.details}>{children}</dl>
        </section>
    )
}

function Detail({ term, children }: { term: string; children: ReactNode }) {
    return (
        <div className={styles.detail}>
            <dt>{term}</dt>
            <dd>{children}</dd>
        </div>
    )
}

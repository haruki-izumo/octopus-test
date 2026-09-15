import { Alert } from '@octoev/mosaic/Alert'
import { Breadcrumb, Breadcrumbs } from '@octoev/mosaic/Breadcrumbs'
import { Divider } from '@octoev/mosaic/Divider'
import { Link } from '@octoev/mosaic/Link'
import { Stack } from '@octoev/mosaic/Stack'
import { ChevronRight } from '@octoev/mosaic-icons'

import { type ContractStatus, getContract } from '@/lib/contracts'
import { formatUkDate } from '@/lib/dates'
import { formatPounds } from '@/lib/money'
import { ordinal } from '@/lib/ordinal'

import styles from './page.module.css'

const NO_CHANGES_REASONS: Record<Exclude<ContractStatus, 'ACTIVE'>, string> = {
    PENDING_VARIATION: 'You can make other changes once you’ve accepted the one waiting for you.',
    TERMINATED: 'This lease has ended, so it can’t be changed.',
}

export default async function ContractPage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params
    const contract = await getContract(uuid, { cache: 'no-store' })

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <nav>
                    <Breadcrumbs>
                        <Breadcrumb href="/">Home</Breadcrumb>
                        <Breadcrumb>
                            {contract.vehicle.make} {contract.vehicle.model}
                        </Breadcrumb>
                    </Breadcrumbs>
                </nav>
                <Stack direction="horizontal" align="center" gap={4} wrap="wrap">
                    <h1>
                        {contract.vehicle.make} {contract.vehicle.model}
                    </h1>
                    <span className={styles.registration}>{contract.vehicle.registration}</span>
                </Stack>
            </header>

            <Divider />

            <div className={styles.sections}>
                <section
                    className={styles.payment}
                    aria-labelledby="payment-heading"
                    data-theme="octopus-dark"
                >
                    <div className={styles.paymentSummary}>
                        <h2 id="payment-heading" className={styles.label}>
                            Monthly payment
                        </h2>
                        <p className={styles.amount}>{formatPounds(contract.monthly_payment)}</p>
                        <p className={styles.muted}>
                            Taken on the {ordinal(contract.billing_day)} of each month
                        </p>
                    </div>
                    {contract.status === 'ACTIVE' ? (
                        <div className={styles.change}>
                            <span className={styles.changeText}>
                                <Link href={`/contracts/${contract.uuid}/billing-day`}>
                                    Change my payment date
                                </Link>
                                <span className={styles.muted}>
                                    Choose the day your payment is taken each month
                                </span>
                            </span>
                            <ChevronRight aria-hidden className={styles.chevron} />
                        </div>
                    ) : (
                        <Alert variant="information" title={NO_CHANGES_REASONS[contract.status]} />
                    )}
                </section>

                <section className={styles.section} aria-labelledby="details-heading">
                    <h2 id="details-heading">Your lease</h2>
                    <dl className={styles.details}>
                        <div className={styles.detail}>
                            <dt>Annual mileage</dt>
                            <dd>{contract.annual_mileage.toLocaleString('en-GB')} miles</dd>
                        </div>
                        <div className={styles.detail}>
                            <dt>Term</dt>
                            <dd>
                                {contract.term_months} months ({contract.months_remaining}{' '}
                                remaining)
                            </dd>
                        </div>
                        <div className={styles.detail}>
                            <dt>Start date</dt>
                            <dd>{formatUkDate(contract.start_date)}</dd>
                        </div>
                        <div className={styles.detail}>
                            <dt>End date</dt>
                            <dd>{formatUkDate(contract.end_date)}</dd>
                        </div>
                    </dl>
                </section>
            </div>
        </div>
    )
}

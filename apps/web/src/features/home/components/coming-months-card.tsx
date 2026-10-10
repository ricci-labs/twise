import { CommittedChart } from '@web/components/charts/committed-chart'
import { Card } from '@web/components/display/card'
import { ResponsiveText } from '@web/components/display/responsive-text'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { homeMessages } from '@web/features/home/home.messages'
import type { ComingMonthsCardProps, CommittedPeriod } from '@web/features/home/home.types'
import { formatMonthLabel, formatMonthTitle } from '@web/lib/format/calendar'

const messages = homeMessages.comingMonths
const HIGH_PERCENT = 70
const FULL = 100

export function ComingMonthsCard({ overview, className }: ComingMonthsCardProps) {
  const months = overview.metrics.committedAhead
  const firstHigh = months.find(isHigh)
  const verdict = firstHigh
    ? messages.high(formatMonthTitle(firstHigh.label), firstHigh.percentOfIncome ?? 0)
    : messages.calm
  const shortVerdict = firstHigh
    ? messages.highShort(formatMonthTitle(firstHigh.label), firstHigh.percentOfIncome ?? 0)
    : messages.calm
  return (
    <Card
      id="coming-months"
      className={className}
      title={messages.title}
      description={messages.description}
      headerAction={
        <ul className="hidden gap-4 text-body-sm text-ink-muted lg:flex" aria-hidden="true">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-chart-4" />
            {messages.installments}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-chart-2" />
            {messages.planned}
          </li>
        </ul>
      }
      footerStat={
        firstHigh ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-warning">
            <TwiseIcon name="warn" tone="warning" size="sm" />
            <ResponsiveText short={shortVerdict} long={verdict} />
          </span>
        ) : (
          verdict
        )
      }
    >
      <CommittedChart
        legendClassName="lg:hidden"
        limitPercent={HIGH_PERCENT}
        limitLabel={messages.limit(HIGH_PERCENT)}
        installmentsLabel={messages.installments}
        plannedLabel={messages.planned}
        description={verdict}
        months={months.map((month) => ({
          key: month.label,
          label: formatMonthLabel(month.label),
          installmentsPercent: shareOf(month.installmentsCents, month.fixedIncomeCents),
          plannedPercent: shareOf(month.plannedCents, month.fixedIncomeCents),
          percentLabel: month.percentOfIncome === null ? '—' : `${month.percentOfIncome}%`,
          isHigh: isHigh(month),
        }))}
      />
    </Card>
  )
}

function isHigh(month: CommittedPeriod): boolean {
  return (month.percentOfIncome ?? 0) >= HIGH_PERCENT
}

function shareOf(cents: number, incomeCents: number): number {
  return incomeCents > 0 ? (cents / incomeCents) * FULL : 0
}

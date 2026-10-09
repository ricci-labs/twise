import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import piggyBank from '@web/assets/illustrations/piggy-bank.svg'
import piggyBankAlert from '@web/assets/illustrations/piggy-bank-alert.svg'
import { TextLink } from '@web/components/actions/text-link'
import { Amount } from '@web/components/display/amount'
import { HelpPopover } from '@web/components/display/help-popover'
import { KpiBadge, KpiCard } from '@web/components/display/kpi-card'
import { KpiCarousel } from '@web/components/display/kpi-carousel'
import { homeMessages } from '@web/features/home/home.messages'
import type { HomeIndicatorsProps } from '@web/features/home/home.types'
import { formatDayMonth } from '@web/lib/format/calendar'

const messages = homeMessages.kpis

export function HomeIndicators(props: HomeIndicatorsProps) {
  return (
    <KpiCarousel>
      {[
        <FreeToSpendCard key="free" {...props} />,
        <IncomeCard key="income" {...props} />,
        <SpentCard key="spent" {...props} />,
        <CommittedCard key="committed" {...props} />,
      ]}
    </KpiCarousel>
  )
}

function FreeToSpendCard({ workspaceId, overview, stage }: HomeIndicatorsProps) {
  const { metrics, period } = overview
  const isOver = stage === 'open' && metrics.freeToSpend < 0
  if (stage === 'closed') {
    return (
      <KpiCard
        label={messages.free.label}
        help={help(messages.free)}
        value={<Amount cents={metrics.freeToSpend} size="kpi" isCentsRaised />}
      >
        <p>{messages.free.closedLabel}</p>
      </KpiCard>
    )
  }
  if (isOver) {
    return (
      <KpiCard
        tone="danger"
        label={messages.free.label}
        help={help(messages.free)}
        value={<Amount cents={metrics.freeToSpend} size="kpi" isCentsRaised />}
        badge={<KpiBadge tone="danger">{messages.free.over}</KpiBadge>}
        art={<img src={piggyBankAlert} alt="" className="size-15 rounded-full" />}
      >
        <p>{messages.free.overReason}</p>
        <TextLink
          tone="inherit"
          render={<Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'planning' }} />}
        >
          {messages.free.adjust}
        </TextLink>
      </KpiCard>
    )
  }
  const perDay = stage === 'open' ? metrics.dailyAllowance : null
  return (
    <KpiCard
      tone="mint"
      label={messages.free.label}
      help={help(messages.free)}
      value={<Amount cents={metrics.freeToSpend} size="kpi" isCentsRaised />}
      badge={
        perDay !== null && (
          <KpiBadge tone="onMint">{messages.free.perDay(formatBrl(perDay))}</KpiBadge>
        )
      }
      art={<img src={piggyBank} alt="" className="size-17 rounded-full" />}
    >
      {stage === 'open' && (
        <p>{messages.free.until(formatDayMonth(period.end), metrics.periodProgress.left)}</p>
      )}
    </KpiCard>
  )
}

function IncomeCard({ overview }: HomeIndicatorsProps) {
  const { metrics } = overview
  const isCommissionApart =
    metrics.budgetIncome === metrics.fixedIncome && metrics.variableIncome > 0
  return (
    <KpiCard
      label={messages.income.label}
      help={help(messages.income)}
      value={<Amount cents={metrics.budgetIncome} size="kpi" />}
    >
      {isCommissionApart && (
        <p className="text-ink-muted">
          {messages.income.commission(formatBrl(metrics.variableIncome))}
        </p>
      )}
    </KpiCard>
  )
}

function SpentCard({ overview }: HomeIndicatorsProps) {
  const { metrics } = overview
  return (
    <KpiCard
      label={messages.spent.label}
      help={help(messages.spent)}
      value={<Amount cents={metrics.spent} size="kpi" />}
      badge={
        metrics.incomeShare && (
          <KpiBadge>{messages.ofIncome(metrics.incomeShare.spentPercent)}</KpiBadge>
        )
      }
    >
      {metrics.spendingAverage && (
        <p className="text-ink-muted">
          {messages.spent.average(formatBrl(metrics.spendingAverage.monthlyCents))}
        </p>
      )}
    </KpiCard>
  )
}

function CommittedCard({ overview, stage }: HomeIndicatorsProps) {
  const { metrics } = overview
  const bills = stage === 'open' ? metrics.billsDue.count : 0
  return (
    <KpiCard
      label={messages.committed.label}
      help={help(messages.committed)}
      value={<Amount cents={metrics.committed} size="kpi" />}
      badge={
        metrics.incomeShare &&
        metrics.committed > 0 && (
          <KpiBadge>{messages.ofIncome(metrics.incomeShare.committedPercent)}</KpiBadge>
        )
      }
    >
      {metrics.committed === 0 && (
        <p className="text-ink-muted">{messages.committed.nothingLeft}</p>
      )}
      {metrics.committed > 0 && bills > 0 && (
        <p className="text-ink-muted">{messages.committed.bills(bills)}</p>
      )}
    </KpiCard>
  )
}

function help({ label, help: text }: { label: string; help: string }) {
  return <HelpPopover topic={label}>{text}</HelpPopover>
}

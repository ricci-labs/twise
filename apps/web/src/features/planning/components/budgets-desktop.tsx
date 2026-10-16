import { formatBrl } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { ProgressBar } from '@web/components/charts/progress-bar'
import { Amount } from '@web/components/display/amount'
import { Card } from '@web/components/display/card'
import { DataTable, DataTableName } from '@web/components/display/data-table'
import { KpiBadge, KpiCard } from '@web/components/display/kpi-card'
import { KpiCarousel } from '@web/components/display/kpi-carousel'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { BudgetLineView, BudgetsViewProps } from '@web/features/planning/planning.types'
import { cn } from '@web/lib/cn'

const messages = planningMessages.budgets
const FULL = 100
const STATUS = {
  over: { icon: 'alert', tone: 'danger', text: 'text-danger' },
  ahead: { icon: 'warn', tone: 'warning', text: 'text-warning' },
  within: { icon: 'ok', tone: 'success', text: 'text-mint-ink' },
} as const

export function BudgetsDesktop({ overview, lines, unbudgeted, onOpen }: BudgetsViewProps) {
  return (
    <>
      {lines.length === 0 ? (
        <EmptyBlock icon="calendar" title={messages.empty} text={messages.emptyText} />
      ) : (
        <>
          <BudgetKpis overview={overview} lines={lines} unbudgeted={unbudgeted} />
          <Card title={messages.withBudget} description={messages.table.description}>
            <DataTable
              label={messages.withBudget}
              layout="budgets"
              columns={[
                { key: 'category', label: messages.table.category },
                { key: 'pace', label: messages.table.pace },
                { key: 'amount', label: messages.table.spentOfLimit, align: 'end' },
                { key: 'status', label: messages.table.status },
                {
                  key: 'actions',
                  label: messages.table.actions,
                  isLabelHidden: true,
                  isActions: true,
                },
              ]}
              rows={lines.map((line) => budgetRowOf(line, overview, onOpen))}
            />
          </Card>
        </>
      )}
      {unbudgeted.length > 0 && (
        <Card title={messages.withoutBudget}>
          <DataTable
            label={messages.withoutBudget}
            layout="unbudgeted"
            columns={[
              { key: 'category', label: messages.table.category },
              { key: 'spent', label: messages.table.spentInPeriod, align: 'end' },
              { key: 'define', label: messages.table.define, isLabelHidden: true, align: 'end' },
            ]}
            rows={unbudgeted.map((category) => ({
              key: category.categoryAccountId,
              cells: [
                <DataTableName key="name" name={category.name} icon={category.art.icon} />,
                <Amount key="spent" cents={category.spentCents} size="inherit" />,
                onOpen ? (
                  <Button
                    key="define"
                    variant="outline"
                    size="xs"
                    aria-label={messages.defineFor(category.name)}
                    onClick={() => onOpen(category.categoryAccountId)}
                  >
                    {messages.define}
                  </Button>
                ) : null,
              ],
            }))}
          />
        </Card>
      )}
    </>
  )
}

function BudgetKpis({ overview, lines }: Omit<BudgetsViewProps, 'onOpen'>) {
  const { budgetTotals, periodProgress } = overview.metrics
  const kpis = messages.kpis
  return (
    <KpiCarousel columns={3}>
      {[
        <KpiCard
          key="limit"
          label={kpis.limit}
          value={<Amount cents={budgetTotals.limitCents} size="kpi" isCentsRaised />}
          badge={<KpiBadge>{kpis.count(budgetTotals.count)}</KpiBadge>}
        >
          <p className="text-ink-muted">{kpis.limitFoot}</p>
        </KpiCard>,
        <KpiCard
          key="spent"
          label={kpis.spent}
          value={<Amount cents={budgetTotals.spentCents} size="kpi" isCentsRaised />}
          badge={<KpiBadge>{kpis.percent(budgetTotals.usedPercent)}</KpiBadge>}
        >
          <p className="text-ink-muted">
            {kpis.paceFoot(
              periodProgress.elapsedPercent,
              periodProgress.elapsed,
              periodProgress.total,
            )}
          </p>
        </KpiCard>,
        <KpiCard
          key="off"
          label={kpis.offPace}
          value={
            <span className="font-display text-amount-kpi">
              {budgetTotals.offPaceCount === 0 ? kpis.none : kpis.count(budgetTotals.offPaceCount)}
            </span>
          }
        >
          <p className="text-ink-muted">{offPaceFootOf(lines)}</p>
        </KpiCard>,
      ]}
    </KpiCarousel>
  )
}

function budgetRowOf(
  line: BudgetLineView,
  overview: BudgetsViewProps['overview'],
  onOpen: BudgetsViewProps['onOpen'],
) {
  const status = STATUS[line.status]
  return {
    key: line.categoryAccountId,
    cells: [
      <DataTableName
        key="name"
        name={line.name}
        icon={line.art.icon}
        artName={line.art.name}
        detail={line.subcategories
          .map((child) => `${child.label} ${formatBrl(child.amountCents)}`)
          .join(' · ')}
      />,
      <ProgressBar
        key="pace"
        percent={line.limitCents > 0 ? (line.spentCents / line.limitCents) * FULL : 0}
        markPercent={overview.metrics.periodProgress.elapsedPercent}
        tone={line.status}
      />,
      <span key="amount" className="text-ink-muted">
        <strong className="font-emphasis text-ink">
          <Amount cents={line.spentCents} size="inherit" />
        </strong>{' '}
        {planningMessages.budgets.of} <Amount cents={line.limitCents} size="inherit" />
      </span>,
      <span
        key="status"
        className={cn('inline-flex items-center gap-1.5 font-semibold', status.text)}
      >
        <TwiseIcon name={status.icon} tone={status.tone} size="sm" />
        {messages.statusShort[line.status]}
      </span>,
      onOpen ? (
        <button
          key="actions"
          type="button"
          aria-label={messages.actions(line.name)}
          onClick={() => onOpen(line.categoryAccountId)}
          className="grid size-9 cursor-pointer place-items-center rounded-full text-ink-muted outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <TwiseIcon name="more" />
        </button>
      ) : null,
    ],
  }
}

function offPaceFootOf(lines: readonly BudgetLineView[]): string {
  const parts = lines.flatMap((line) => {
    if (line.status === 'over') {
      return [messages.kpis.over(line.name)]
    }
    return line.status === 'ahead' ? [messages.kpis.ahead(line.name)] : []
  })
  return parts.length === 0 ? messages.kpis.allWithin : `${parts.join('; ')}.`
}

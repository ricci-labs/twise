import { formatBrl, parseIsoDate } from '@financas/shared'
import { TextLink } from '@web/components/actions/text-link'
import { Amount } from '@web/components/display/amount'
import { Card } from '@web/components/display/card'
import { DataTable, DataTableName } from '@web/components/display/data-table'
import { KpiBadge, KpiCard } from '@web/components/display/kpi-card'
import { KpiCarousel } from '@web/components/display/kpi-carousel'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { RecurrenceActions } from '@web/features/planning/components/recurrence-actions'
import {
  accountPartOf,
  artOf,
  pathOf,
  recurrenceGroupsOf,
  scheduleWordsOf,
} from '@web/features/planning/components/recurrence-rows'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  KpiAmountProps,
  ListedRecurrence,
  NextCellProps,
  RecurrenceCellOptions,
  RecurrenceContext,
  RecurrenceKpisProps,
  RecurrenceList,
  RecurrencesDesktopProps,
} from '@web/features/planning/planning.types'
import { cn } from '@web/lib/cn'
import { formatShortDate, formatShortDateWithYear } from '@web/lib/format/calendar'

const messages = planningMessages.recurrences
const desktop = messages.desktop
const columns = desktop.columns
const ESTIMATE = '≈ '
const AMOUNT_TONES = {
  expense: 'text-ink',
  card_purchase: 'text-ink',
  income: 'text-mint-ink',
  transfer: 'text-ink-muted',
} as const

export function RecurrencesDesktop({
  workspaceId,
  list,
  context,
  canCreate,
  canUpdate,
  canDelete,
  addLinkOf,
}: RecurrencesDesktopProps) {
  const byId = new Map(list.items.map((item) => [item.id, item]))
  return (
    <>
      <RecurrenceKpis list={list} />
      {recurrenceGroupsOf(list, context).map((group) => (
        <Card
          key={group.key}
          title={group.title}
          headerAction={
            canCreate && (
              <TextLink render={addLinkOf(group.key)} className="inline-flex items-center gap-1">
                <TwiseIcon name="plus" size="sm" />
                {messages.add[group.key]}
              </TextLink>
            )
          }
        >
          <DataTable
            label={group.title}
            layout="recurrences"
            columns={[
              { key: 'name', label: columns.name },
              { key: 'schedule', label: columns.schedule },
              { key: 'account', label: columns.account },
              { key: 'category', label: columns.category },
              { key: 'next', label: columns.next },
              { key: 'amount', label: columns.amount, align: 'end' },
              { key: 'actions', label: columns.actions, isLabelHidden: true, isActions: true },
            ]}
            rows={group.rows.flatMap((row) => {
              const item = byId.get(row.id)
              return item
                ? [
                    {
                      key: item.id,
                      cells: cellsOf(item, context, {
                        workspaceId,
                        canUpdate,
                        canDelete,
                      }),
                    },
                  ]
                : []
            })}
          />
        </Card>
      ))}
    </>
  )
}

function RecurrenceKpis({ list }: RecurrenceKpisProps) {
  const { bills, income, transfers } = list.summary
  return (
    <KpiCarousel columns={3}>
      {[
        <KpiCard
          key="bills"
          label={messages.bills}
          value={<KpiAmount cents={bills.monthlyCents} isEstimate={bills.includesEstimate} />}
          badge={<KpiBadge>{messages.billsCount(bills.count)}</KpiBadge>}
        >
          <p className="text-ink-muted">
            {bills.includesAveraged ? desktop.averagedFoot : desktop.billsFoot}
          </p>
        </KpiCard>,
        <KpiCard
          key="income"
          label={messages.income}
          value={<KpiAmount cents={income.monthlyCents} />}
        >
          <p className="text-ink-muted">{incomeFootOf(list)}</p>
        </KpiCard>,
        <KpiCard
          key="transfers"
          label={desktop.transfers}
          value={<KpiAmount cents={transfers.monthlyCents} />}
          badge={<KpiBadge>{desktop.transfersCount(transfers.count)}</KpiBadge>}
        >
          <p className="text-ink-muted">{transfersFootOf(list)}</p>
        </KpiCard>,
      ]}
    </KpiCarousel>
  )
}

function KpiAmount({ cents, isEstimate = false }: KpiAmountProps) {
  return (
    <span className="font-display text-amount-kpi">
      {isEstimate && ESTIMATE}
      <Amount cents={cents} size="inherit" isCentsRaised />
    </span>
  )
}

function cellsOf(
  item: ListedRecurrence,
  context: RecurrenceContext,
  options: RecurrenceCellOptions,
) {
  const art = artOf(item, context)
  return [
    <DataTableName key="name" name={item.description} icon={art.icon} artName={art.name} />,
    scheduleWordsOf(item.schedule),
    accountPartOf(item, context),
    item.entryType === 'transfer'
      ? desktop.noCategory
      : (pathOf(item.categoryAccountId, context) ?? desktop.noCategory),
    <NextCell key="next" item={item} today={context.today} />,
    <span key="amount" className={cn('font-emphasis', AMOUNT_TONES[item.entryType])}>
      {item.amountIsEstimate && ESTIMATE}
      <Amount cents={item.amountCents} size="inherit" />
    </span>,
    options.canUpdate ? (
      <RecurrenceActions
        key="actions"
        workspaceId={options.workspaceId}
        recurrence={item}
        canDelete={options.canDelete}
        triggerLabel={messages.actions.trigger(item.description)}
        className="grid size-9 cursor-pointer place-items-center rounded-full text-ink-muted outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <TwiseIcon name="more" />
      </RecurrenceActions>
    ) : null,
  ]
}

function NextCell({ item, today }: NextCellProps) {
  if (!item.nextOn) {
    return <span>{desktop.noCategory}</span>
  }
  if (item.nextIsOverdue) {
    return (
      <span className="font-semibold text-danger">
        {desktop.overdue(formatShortDate(item.nextOn))}
      </span>
    )
  }
  if (item.nextOn === today) {
    return <span className="font-semibold text-warning">{messages.dueToday}</span>
  }
  const isThisYear = parseIsoDate(item.nextOn).year === parseIsoDate(today).year
  return (
    <span>{isThisYear ? formatShortDate(item.nextOn) : formatShortDateWithYear(item.nextOn)}</span>
  )
}

function incomeFootOf({ items, summary }: RecurrenceList): string {
  const { leftOutEstimateCount, leftOutEstimateCents } = summary.income
  if (leftOutEstimateCount === 0) {
    return desktop.incomeFoot
  }
  const [only] = items.filter((item) => item.entryType === 'income' && item.amountIsEstimate)
  const amount = formatBrl(leftOutEstimateCents)
  return leftOutEstimateCount === 1 && only
    ? desktop.leftOutFoot(only.description, amount)
    : desktop.leftOutManyFoot(amount)
}

function transfersFootOf({ items, summary }: RecurrenceList): string {
  const transfers = items.filter((item) => item.entryType === 'transfer')
  const [only] = transfers
  if (summary.transfers.count === 1 && only) {
    const words = scheduleWordsOf(only.schedule)
    return desktop.oneTransfer(only.description, words.charAt(0).toLowerCase() + words.slice(1))
  }
  return desktop.transfersCount(summary.transfers.count)
}

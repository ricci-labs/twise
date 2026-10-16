import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { Card } from '@web/components/display/card'
import { DataTable, DataTableName } from '@web/components/display/data-table'
import { RichText } from '@web/components/display/rich-text'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import {
  OccurrenceActions,
  recordLabelOf,
} from '@web/features/planning/components/occurrence-actions'
import {
  occurrenceAccountOf,
  occurrenceGroupsOf,
} from '@web/features/planning/components/occurrence-groups'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  ListedOccurrence,
  OccurrenceRowView,
  OccurrencesTableProps,
} from '@web/features/planning/planning.types'
import { formatMonthLabel, formatShortDate, formatShortWeekday } from '@web/lib/format/calendar'
import { useState } from 'react'

const messages = planningMessages.occurrences
const table = messages.table
const SHOWN_PER_GROUP = 5
const BADGE_TONES = {
  overdue: 'danger',
  today: 'warning',
  paid: 'success',
  received: 'success',
  done: 'success',
  skipped: 'neutral',
} as const

export function OccurrencesTable({
  workspaceId,
  list,
  context,
  accounts,
  canUpdate,
  canRecord,
  periodLabel,
}: OccurrencesTableProps) {
  const [isOpen, setIsOpen] = useState(false)
  const byId = new Map(list.items.map((item) => [item.id, item]))
  const groups = occurrenceGroupsOf(list, context)
  const hidden = isOpen
    ? 0
    : groups.reduce((sum, group) => sum + Math.max(0, group.rows.length - SHOWN_PER_GROUP), 0)
  const rows = groups.flatMap((group) => [
    { key: `band-${group.key}`, band: `${group.title} ${group.count}` },
    ...(isOpen ? group.rows : group.rows.slice(0, SHOWN_PER_GROUP)).map((row) => {
      const item = byId.get(row.id)
      return {
        key: row.id,
        cells: item
          ? cellsOf(row, item, { workspaceId, accounts, context, canUpdate, canRecord })
          : [],
      }
    }),
  ])
  const { toPay, toReceive } = list.totals
  return (
    <Card
      title={table.title(formatMonthLabel(periodLabel))}
      description={
        <RichText
          text={table.summary(
            formatBrl(toPay.amountCents),
            toPay.overdueCount,
            formatBrl(toReceive.amountCents),
          )}
        />
      }
    >
      <DataTable
        label={table.title(formatMonthLabel(periodLabel))}
        layout="occurrences"
        columns={[
          { key: 'due', label: table.due },
          { key: 'name', label: table.name },
          { key: 'account', label: table.account },
          { key: 'status', label: table.status },
          { key: 'amount', label: table.amount, align: 'end' },
          { key: 'action', label: table.action, isLabelHidden: true, align: 'end' },
          { key: 'more', label: table.more, isLabelHidden: true, isActions: true },
        ]}
        rows={rows}
      />
      {hidden > 0 && <ShowMoreButton hiddenCount={hidden} onClick={() => setIsOpen(true)} />}
    </Card>
  )
}

function cellsOf(
  row: OccurrenceRowView,
  item: ListedOccurrence,
  options: Pick<
    OccurrencesTableProps,
    'workspaceId' | 'accounts' | 'context' | 'canUpdate' | 'canRecord'
  >,
) {
  const category = options.accounts.get(item.categoryAccountId)
  return [
    <span key="due" className="flex flex-col">
      <b className={row.isOverdue ? 'font-emphasis text-danger' : 'font-emphasis text-ink'}>
        {formatShortDate(row.dueOn)}
      </b>
      <small className="text-caption">{formatShortWeekday(row.dueOn)}</small>
    </span>,
    <DataTableName key="name" name={row.description} icon={category?.icon ?? null} />,
    occurrenceAccountOf(item, options.context),
    <Badge key="status" tone={row.badge ? BADGE_TONES[row.badge] : 'info'} size="compact" hasDot>
      {row.badge ? table.badges[row.badge] : table.upcoming}
    </Badge>,
    <span key="amount" className={row.isDone ? 'text-ink-muted' : 'font-emphasis text-ink'}>
      {row.isEstimate && '≈ '}
      <Amount cents={row.amountCents} size="inherit" />
    </span>,
    mainActionOf(item, options),
    options.canUpdate ? (
      <OccurrenceActions
        key="more"
        workspaceId={options.workspaceId}
        occurrence={item}
        accounts={options.accounts}
        canRecord={options.canRecord}
        triggerLabel={messages.actions.trigger(item.description)}
        className="grid size-9 cursor-pointer place-items-center rounded-full text-ink-muted outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <TwiseIcon name="more" />
      </OccurrenceActions>
    ) : null,
  ]
}

function mainActionOf(
  item: ListedOccurrence,
  { workspaceId, canRecord }: Pick<OccurrencesTableProps, 'workspaceId' | 'canRecord'>,
) {
  if (item.status === 'matched' && item.matchedEntryId) {
    return (
      <Button
        key="action"
        variant="outline"
        size="xs"
        render={
          <Link
            to="/w/$workspaceId/entries/$entry"
            params={{ workspaceId, entry: item.matchedEntryId }}
          />
        }
      >
        {table.seeEntry}
      </Button>
    )
  }
  if (item.status !== 'pending' || !canRecord) {
    return null
  }
  return (
    <Button
      key="action"
      variant="outline"
      size="xs"
      aria-label={recordLabelOf(item)}
      render={
        <Link
          to="."
          search={(previous) => ({ ...previous, entry: 'new', entryOccurrence: item.id })}
        />
      }
    >
      {item.entryType === 'income' ? messages.actions.recordIncome : messages.actions.recordPayment}
    </Button>
  )
}

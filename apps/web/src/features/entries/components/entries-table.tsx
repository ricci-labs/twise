import { Link } from '@tanstack/react-router'
import { Card } from '@web/components/display/card'
import {
  DataTable,
  type DataTableBand,
  DataTableName,
  type DataTableRow,
} from '@web/components/display/data-table'
import { EntryAmount, EntryMarks } from '@web/components/finance/entry-row'
import { entryDaysOf } from '@web/features/entries/components/entry-days'
import { EntryDetailActions } from '@web/features/entries/components/entry-detail-actions'
import { entryRowOf } from '@web/features/entries/components/entry-row-view'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { EntriesTableProps } from '@web/features/entries/entries.types'
import { formatMonthTitle } from '@web/lib/format/calendar'

const messages = entriesMessages.list
const COLUMNS = [
  { key: 'entry', label: messages.table.entry },
  { key: 'category', label: messages.table.category },
  { key: 'account', label: messages.table.account },
  { key: 'spentBy', label: messages.table.spentBy },
  { key: 'amount', label: messages.table.amount, align: 'end' },
  { key: 'actions', label: messages.table.actions, isLabelHidden: true, isActions: true },
] as const

export function EntriesTable({
  workspaceId,
  permissions,
  shown,
  today,
  entries,
  context,
  headline,
  more,
}: EntriesTableProps) {
  const rows = entryDaysOf(entries, today).flatMap((day): (DataTableRow | DataTableBand)[] => [
    { key: day.date, band: [day.title, day.detail].filter(Boolean).join(messages.separator) },
    ...day.entries.map((entry) => {
      const row = entryRowOf(entry, context)
      return {
        key: row.id,
        cells: [
          <DataTableName
            key="entry"
            name={row.description}
            artName={row.art.name}
            icon={row.art.icon}
            badges={
              (row.installmentCount > 1 || row.isShared) && (
                <EntryMarks installmentCount={row.installmentCount} isShared={row.isShared} />
              )
            }
            link={
              <Link to="/w/$workspaceId/entries/$entry" params={{ workspaceId, entry: row.id }} />
            }
          />,
          row.columns.category,
          row.columns.account,
          row.columns.spentBy,
          <EntryAmount
            key="amount"
            amountCents={row.amountCents}
            direction={row.direction}
            className="text-choice"
          />,
          <EntryDetailActions
            key="actions"
            workspaceId={workspaceId}
            permissions={permissions}
            entry={entry}
            isOnClosedInvoice={false}
            isInList
          />,
        ],
      }
    }),
  ])
  return (
    <Card
      title={shown.kind === 'period' ? formatMonthTitle(shown.period.label) : shown.title}
      description={headline}
    >
      <DataTable label={messages.title} layout="entries" columns={COLUMNS} rows={rows} />
      <div className="flex flex-col items-center border-t border-border pt-4">{more}</div>
    </Card>
  )
}

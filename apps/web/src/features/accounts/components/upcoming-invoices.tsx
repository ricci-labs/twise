import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Badge } from '@web/components/display/badge'
import { Card } from '@web/components/display/card'
import {
  DataTable,
  DataTableAmount,
  type DataTableColumn,
  DataTableName,
} from '@web/components/display/data-table'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  InvoiceState,
  UpcomingInvoice,
  UpcomingInvoicesProps,
} from '@web/features/accounts/accounts.types'
import { upcomingInvoicesQueryOptions } from '@web/features/accounts/api/accounts.queries'
import { stateLabelOf, stateToneOf } from '@web/features/accounts/components/card-invoices'
import { ApiError } from '@web/lib/api/api-error'
import { formatMonthTitle, formatShortDate } from '@web/lib/format/calendar'

const messages = accountsMessages.cardsPage.upcoming
const columns = messages.columns

const CARD_ICON = 'card'

const COLUMNS: readonly DataTableColumn[] = [
  { key: 'card', label: columns.card },
  { key: 'invoice', label: columns.invoice },
  { key: 'closing', label: columns.closing },
  { key: 'due', label: columns.due },
  { key: 'status', label: columns.status },
  { key: 'total', label: columns.total, align: 'end' },
  { key: 'actions', label: columns.actions, isLabelHidden: true, isActions: true },
]

export function UpcomingInvoices({ workspaceId, cards }: UpcomingInvoicesProps) {
  const upcoming = useQuery(upcomingInvoicesQueryOptions(workspaceId))
  if (upcoming.isError) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={upcoming.error instanceof ApiError ? upcoming.error.ref : null}
        isRetrying={upcoming.isFetching}
        onRetry={() => void upcoming.refetch()}
      />
    )
  }
  if (!upcoming.data) {
    return <SectionSkeleton lines={4} />
  }
  const byId = new Map(cards.map((card) => [card.accountId, card]))
  const rows = upcoming.data.flatMap((invoice) => {
    const card = byId.get(invoice.cardAccountId)
    return card ? [rowOf(workspaceId, invoice, card.name, card.icon ?? CARD_ICON)] : []
  })
  if (rows.length === 0) {
    return null
  }
  return (
    <Card title={messages.title} description={messages.description}>
      <DataTable label={messages.title} layout="invoices" columns={COLUMNS} rows={rows} />
    </Card>
  )
}

function rowOf(workspaceId: string, invoice: UpcomingInvoice, name: string, icon: string) {
  const state: InvoiceState = invoice.status
  return {
    key: `${invoice.cardAccountId}-${invoice.referenceMonth}`,
    cells: [
      <DataTableName
        key="card"
        name={name}
        icon={icon}
        link={
          <Link
            to="/w/$workspaceId/cards/$card"
            params={{ workspaceId, card: invoice.cardAccountId }}
            search={{ month: invoice.referenceMonth }}
          />
        }
      />,
      formatMonthTitle(invoice.referenceMonth),
      formatShortDate(invoice.closingOn),
      formatShortDate(invoice.dueOn),
      <Badge key="status" tone={stateToneOf(state)} size="status" hasDot>
        {stateLabelOf(state)}
      </Badge>,
      <DataTableAmount key="total" cents={invoice.totalCents} />,
      null,
    ],
  }
}

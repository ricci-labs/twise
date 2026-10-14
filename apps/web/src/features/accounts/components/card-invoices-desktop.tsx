import { formatBrl } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Amount } from '@web/components/display/amount'
import { Card } from '@web/components/display/card'
import {
  DataTable,
  DataTableAmount,
  type DataTableColumn,
  DataTableName,
} from '@web/components/display/data-table'
import { KpiBadge, KpiCard } from '@web/components/display/kpi-card'
import { KpiCarousel } from '@web/components/display/kpi-carousel'
import { InvoiceMonthStrip } from '@web/components/finance/invoice-month-strip'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { PageHeader } from '@web/components/layout/page-header'
import { Breadcrumb } from '@web/components/navigation/breadcrumb'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  CardInvoicesDesktopProps,
  CardSummary,
  InvoiceFilter,
  InvoiceLinesTableProps,
  WorkspaceMember,
} from '@web/features/accounts/accounts.types'
import { membersQueryOptions } from '@web/features/accounts/api/accounts.queries'
import { AccountRowActions } from '@web/features/accounts/components/account-row-actions'
import { cardEditActionsOf } from '@web/features/accounts/components/card-edit-actions'
import { filteredLines, stateLabelOf } from '@web/features/accounts/components/card-invoices'
import { listedCardOf } from '@web/features/accounts/components/listed-accounts'
import { PayInvoiceButton } from '@web/features/accounts/components/pay-invoice-button'
import { formatShortDate } from '@web/lib/format/calendar'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = accountsMessages.invoicesPage
const desktop = messages.desktop
const kpis = desktop.kpis
const filters = accountsMessages.invoicePage

const COLUMNS: readonly DataTableColumn[] = [
  { key: 'date', label: desktop.columns.date },
  { key: 'entry', label: desktop.columns.entry },
  { key: 'installment', label: desktop.columns.installment },
  { key: 'fronted', label: desktop.columns.fronted },
  { key: 'amount', label: desktop.columns.amount, align: 'end' },
]

const FILTERS = [
  { value: 'all', label: filters.filters.all },
  { value: 'own', label: filters.filters.own },
  { value: 'fronted', label: filters.filters.fronted },
]

export function CardInvoicesDesktop({
  workspaceId,
  permissions,
  card,
  invoice,
  months,
  lines,
  onAll,
}: CardInvoicesDesktopProps) {
  const members = useQuery({
    ...membersQueryOptions(workspaceId),
    enabled: hasPermission(permissions, 'members', 'view'),
  })
  return (
    <div className="mx-auto flex w-full max-w-296 flex-col px-8 pt-7 pb-12">
      <div className="mb-2">
        <Breadcrumb
          label={desktop.crumb}
          items={[
            {
              label: desktop.cards,
              link: <Link to="/w/$workspaceId/cards" params={{ workspaceId }} />,
            },
            { label: card.name },
          ]}
        />
      </div>
      <PageHeader
        title={card.name}
        description={descriptionOf(card, members.data ?? null)}
        actions={
          <>
            <AccountRowActions
              workspaceId={workspaceId}
              permissions={permissions}
              account={listedCardOf(card)}
              leadingActions={cardEditActionsOf(permissions, card.accountId)}
            />
            <PayInvoiceButton permissions={permissions} card={card} invoice={invoice} />
          </>
        }
      />
      <div className="mt-4.5">
        <InvoiceMonthStrip
          label={messages.strip(card.name)}
          anchor={card.currentInvoice.referenceMonth}
          allLabel={messages.all}
          onAll={onAll}
          months={months}
          size="wide"
        />
      </div>
      <div className="mt-5">
        <KpiCarousel columns={4}>
          {[
            <KpiCard
              key="total"
              label={kpis.total}
              value={<Amount cents={invoice.totalCents} size="kpi" isCentsRaised />}
              badge={<KpiBadge>{stateLabelOf(invoice.state)}</KpiBadge>}
            >
              <p className="text-ink-muted">
                {messages.dates(formatShortDate(invoice.closingOn), formatShortDate(invoice.dueOn))}
              </p>
            </KpiCard>,
            <KpiCard
              key="due"
              label={kpis.due}
              value={<Amount cents={invoice.dueCents} size="kpi" isCentsRaised />}
            >
              <p className="text-ink-muted">{kpis.paidSoFar(formatBrl(invoice.paidCents))}</p>
            </KpiCard>,
            <KpiCard
              key="own"
              label={kpis.own}
              value={<Amount cents={invoice.ownCents} size="kpi" isCentsRaised />}
            >
              <p className="text-ink-muted">{kpis.ownFoot}</p>
            </KpiCard>,
            <KpiCard
              key="fronted"
              label={kpis.fronted}
              value={<Amount cents={invoice.frontedCents} size="kpi" isCentsRaised />}
            >
              <p className="text-ink-muted">{kpis.frontedFoot}</p>
            </KpiCard>,
          ]}
        </KpiCarousel>
      </div>
      <div className="mt-5">
        <InvoiceLinesTable lines={lines} />
      </div>
    </div>
  )
}

function InvoiceLinesTable({ lines }: InvoiceLinesTableProps) {
  const [filter, setFilter] = useState<InvoiceFilter>('all')
  const shown = lines ? filteredLines(lines, filter) : []
  return (
    <Card
      title={desktop.linesTitle}
      description={desktop.linesCount(lines?.length ?? 0)}
      headerAction={
        <ChoiceChips
          label={filters.filter}
          value={filter}
          onSelect={(value) => setFilter(value as InvoiceFilter)}
          options={FILTERS}
        />
      }
    >
      {shown.length > 0 ? (
        <DataTable
          label={desktop.linesTitle}
          layout="lines"
          columns={COLUMNS}
          rows={shown.map((line) => ({
            key: line.key,
            cells: [
              line.date,
              <DataTableName key="entry" name={line.description} icon={line.icon} />,
              line.installment ?? desktop.none,
              line.frontedCents > 0 ? formatBrl(line.frontedCents) : desktop.none,
              <DataTableAmount key="amount" cents={line.amountCents} />,
            ],
          }))}
        />
      ) : (
        <p className="text-note text-ink-muted">{emptyTextOf(filter)}</p>
      )}
    </Card>
  )
}

function descriptionOf(card: CardSummary, members: readonly WorkspaceMember[] | null): string {
  const cycle = accountsMessages.cardsPage.cycle(card.closingDay, card.dueDay)
  const holder = members?.find((member) => member.userId === card.holderUserId)?.displayName
  const withHolder = holder ? accountsMessages.cardsPage.withHolder(cycle, holder) : cycle
  if (card.limitCents === null || card.limitUsedPercent === null) {
    return withHolder
  }
  return desktop.joined(
    withHolder,
    desktop.limit(formatBrl(card.limitCents), card.limitUsedPercent),
  )
}

function emptyTextOf(filter: InvoiceFilter): string {
  if (filter === 'own') {
    return filters.noneOwn
  }
  if (filter === 'fronted') {
    return filters.noneFronted
  }
  return messages.noLines
}

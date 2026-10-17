import type { IsoDate } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { ItemActions } from '@web/components/actions/item-actions'
import { TextLink } from '@web/components/actions/text-link'
import { Amount } from '@web/components/display/amount'
import { ArchivedToggle } from '@web/components/display/archived-toggle'
import { Avatar } from '@web/components/display/avatar'
import { Card } from '@web/components/display/card'
import { DataTable } from '@web/components/display/data-table'
import { DateBlock } from '@web/components/display/date-block'
import { KpiBadge, KpiCard } from '@web/components/display/kpi-card'
import { KpiCarousel } from '@web/components/display/kpi-carousel'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { ContactChannels, ContactOwed, ContactState } from '@web/components/finance/contact-row'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import {
  pixReceiverQueryOptions,
  upcomingContactItemsQueryOptions,
} from '@web/features/contacts/api/contacts.queries'
import { contactLink } from '@web/features/contacts/components/contact-links'
import { contactsSummaryOf, sortContacts } from '@web/features/contacts/components/listed-contacts'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import { CONTACT_SORTS } from '@web/features/contacts/contacts.schemas'
import type {
  ChargeChannelRowProps,
  ChargeChannelsCardProps,
  ContactNameCellProps,
  ContactsDesktopProps,
  ContactsKpiAmountProps,
  ContactsKpisProps,
  ContactsTableProps,
  ContactTableActionsProps,
  ListedContact,
  UpcomingBodyProps,
  UpcomingCardProps,
  UpcomingContactItem,
} from '@web/features/contacts/contacts.types'
import { ApiError } from '@web/lib/api/api-error'
import { formatShortDate } from '@web/lib/format/calendar'
import { Mail, MessageCircle, QrCode } from 'lucide-react'

const messages = contactsMessages
const desktop = messages.desktop
const columns = desktop.columns
const SORT_OPTIONS = CONTACT_SORTS.map((sort) => ({ value: sort, label: messages.sort[sort] }))
const UPCOMING_ROWS = 4

export function ContactsDesktop({
  workspaceId,
  active,
  archived,
  canCreate,
  canUpdate,
  canChangeSettings,
  sort,
  onSortChange,
  onCharge,
}: ContactsDesktopProps) {
  const tableProps = { workspaceId, canCreate, canUpdate, onCharge }
  return (
    <>
      <ContactsKpis workspaceId={workspaceId} contacts={active} />
      <Card
        title={desktop.table(active.length)}
        description={desktop.sortNote[sort]}
        headerAction={
          <ChoiceChips
            label={messages.sort.label}
            variant="pillOutline"
            size="compact"
            options={SORT_OPTIONS}
            value={sort}
            onSelect={(next) => {
              const chosen = CONTACT_SORTS.find((option) => option === next)
              if (chosen) {
                onSortChange(chosen)
              }
            }}
          />
        }
      >
        <div className="flex flex-col gap-3">
          <ContactsTable
            {...tableProps}
            label={messages.list}
            contacts={sortContacts(active, sort)}
          />
          <ArchivedToggle count={archived.length} gender="masculine">
            <ContactsTable {...tableProps} label={messages.archivedList} contacts={archived} />
          </ArchivedToggle>
        </div>
      </Card>
      <div className="grid grid-cols-5 items-stretch gap-5">
        <div className="col-span-3 flex">
          <UpcomingCard workspaceId={workspaceId} />
        </div>
        <div className="col-span-2 flex">
          <ChargeChannelsCard workspaceId={workspaceId} canChangeSettings={canChangeSettings} />
        </div>
      </div>
    </>
  )
}

function ContactsKpis({ workspaceId, contacts }: ContactsKpisProps) {
  const summary = contactsSummaryOf(contacts)
  const late = contacts.filter((contact) => contact.overdueCents > 0)
  const [next] = useQuery(upcomingContactItemsQueryOptions(workspaceId)).data ?? []
  return (
    <KpiCarousel columns={3}>
      {[
        <KpiCard
          key="owed"
          label={messages.summary.owed}
          value={<KpiAmount cents={summary.owedCents} />}
          badge={<KpiBadge>{desktop.contactsCount(summary.owingCount)}</KpiBadge>}
        >
          <p className="text-ink-muted">{desktop.owedNote}</p>
        </KpiCard>,
        <KpiCard
          key="overdue"
          tone={summary.overdueCents > 0 ? 'danger' : 'plain'}
          label={messages.summary.overdue}
          value={<KpiAmount cents={summary.overdueCents} />}
          badge={
            summary.overdueCount > 0 && (
              <KpiBadge>{desktop.contactsCount(summary.overdueCount)}</KpiBadge>
            )
          }
        >
          <p className="text-ink-muted">{overdueNoteOf(late)}</p>
        </KpiCard>,
        <KpiCard
          key="next"
          label={desktop.next}
          value={<KpiAmount cents={next?.remainingCents ?? 0} />}
          badge={next && <KpiBadge>{formatShortDate(next.dueOn as IsoDate)}</KpiBadge>}
        >
          <p className="text-ink-muted">
            {next ? desktop.nextNote(next.contactName, next.description) : desktop.nothingNext}
          </p>
        </KpiCard>,
      ]}
    </KpiCarousel>
  )
}

function KpiAmount({ cents }: ContactsKpiAmountProps) {
  return (
    <span className="font-display text-amount-kpi">
      <Amount cents={cents} size="inherit" isCentsRaised />
    </span>
  )
}

function ContactsTable({ workspaceId, label, contacts, ...options }: ContactsTableProps) {
  return (
    <DataTable
      label={label}
      layout="contacts"
      columns={[
        { key: 'contact', label: columns.contact },
        { key: 'channels', label: columns.channels },
        { key: 'state', label: columns.state },
        { key: 'owed', label: columns.owed, align: 'end' },
        { key: 'charge', label: columns.charge, isLabelHidden: true, align: 'end' },
        { key: 'actions', label: columns.actions, isLabelHidden: true, isActions: true },
      ]}
      rows={contacts.map((contact) => ({
        key: contact.id,
        cells: [
          <ContactNameCell key="contact" workspaceId={workspaceId} contact={contact} />,
          <ContactChannels
            key="channels"
            channels={contact.channels}
            className="flex flex-wrap gap-x-3 gap-y-1 [&_svg]:size-3.5"
          />,
          <ContactState
            key="state"
            {...contact}
            className="line-clamp-2 text-ink [&>[data-slot=badge]]:me-1.5 [&>[data-slot=badge]]:align-text-bottom"
          />,
          <span key="owed" className="text-body">
            <ContactOwed owedCents={contact.owedCents} overdueCents={contact.overdueCents} />
          </span>,
          options.canCreate && contact.hasDueToCharge ? (
            <Button
              key="charge"
              size="xs"
              aria-label={desktop.chargeLabel(contact.name)}
              onClick={() => options.onCharge(contact.id)}
            >
              {columns.charge}
            </Button>
          ) : null,
          <ContactTableActions
            key="actions"
            workspaceId={workspaceId}
            contact={contact}
            {...options}
          />,
        ],
      }))}
    />
  )
}

function ContactNameCell({ workspaceId, contact }: ContactNameCellProps) {
  return (
    <Link
      to="/w/$workspaceId/contacts/$contact"
      params={{ workspaceId, contact: contact.id }}
      className="flex min-w-0 items-center gap-3 rounded-md font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
    >
      <Avatar name={contact.name} tone="paper" size="lg" />
      <span className="line-clamp-2 break-words">{contact.name}</span>
    </Link>
  )
}

function ContactTableActions({
  workspaceId,
  contact,
  canCreate,
  canUpdate,
  onCharge,
}: ContactTableActionsProps) {
  const actions = desktop.actions
  return (
    <ItemActions
      title={contact.name}
      triggerLabel={actions.trigger(contact.name)}
      actions={[
        {
          key: 'open',
          label: actions.open,
          icon: 'user',
          render: contactLink(workspaceId, contact.id),
        },
        ...(canCreate && contact.owedCents > 0
          ? [
              {
                key: 'charge',
                label: actions.charge,
                icon: 'list' as const,
                onSelect: () => onCharge(contact.id),
              },
            ]
          : []),
        ...(canUpdate
          ? [
              {
                key: 'edit',
                label: actions.edit,
                icon: 'edit' as const,
                render: (
                  <Link to="." search={(previous) => ({ ...previous, contact: contact.id })} />
                ),
              },
            ]
          : []),
      ]}
    />
  )
}

function UpcomingCard({ workspaceId }: UpcomingCardProps) {
  const upcoming = useQuery(upcomingContactItemsQueryOptions(workspaceId))
  return (
    <Card title={desktop.upcoming} description={desktop.upcomingNote} className="flex-1">
      <UpcomingBody upcoming={upcoming} />
    </Card>
  )
}

function UpcomingBody({ upcoming }: UpcomingBodyProps) {
  if (upcoming.isError) {
    return (
      <SectionError
        message={desktop.upcomingFailed}
        errorRef={upcoming.error instanceof ApiError ? upcoming.error.ref : null}
        isRetrying={upcoming.isFetching}
        onRetry={() => void upcoming.refetch()}
      />
    )
  }
  if (!upcoming.data) {
    return <ListSkeleton rows={UPCOMING_ROWS} />
  }
  if (upcoming.data.length === 0) {
    return <p className="text-body-sm text-ink-muted">{desktop.upcomingEmpty}</p>
  }
  return (
    <ul aria-label={desktop.upcoming} className="flex flex-col">
      {upcoming.data.map((item) => (
        <li
          key={`${item.postingId}-${item.dueOn}`}
          className="flex items-center gap-3 border-border py-3 not-first:border-t"
        >
          <DateBlock date={item.dueOn as IsoDate} digits="padded" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="line-clamp-2 font-semibold text-body-sm text-ink">
              {item.contactName}
            </span>
            <span className="line-clamp-2 text-note text-ink-muted">{upcomingLabelOf(item)}</span>
          </span>
          <Amount cents={item.remainingCents} size="inherit" className="font-emphasis text-ink" />
        </li>
      ))}
    </ul>
  )
}

function ChargeChannelsCard({ workspaceId, canChangeSettings }: ChargeChannelsCardProps) {
  const receiver = useQuery(pixReceiverQueryOptions(workspaceId)).data
  const hasPix = Boolean(receiver?.name && receiver.city)
  const pixLink = <Link to="/w/$workspaceId/settings/pix" params={{ workspaceId }} />
  return (
    <Card title={desktop.channels} description={desktop.channelsNote} className="flex-1">
      <ul className="flex flex-col">
        <ChargeChannelRow
          icon={<QrCode aria-hidden="true" />}
          label={desktop.pix}
          value={
            hasPix && receiver?.name && receiver.city
              ? desktop.pixReceiver(receiver.name, receiver.city)
              : desktop.pixMissing
          }
          action={
            canChangeSettings && (
              <TextLink render={pixLink}>{hasPix ? desktop.pixEdit : desktop.pixSetUp}</TextLink>
            )
          }
        />
        <ChargeChannelRow
          icon={<MessageCircle aria-hidden="true" />}
          label={desktop.whatsapp}
          value={desktop.whatsappHow}
        />
        <ChargeChannelRow
          icon={<Mail aria-hidden="true" />}
          label={desktop.email}
          value={desktop.emailHow}
        />
      </ul>
    </Card>
  )
}

function ChargeChannelRow({ icon, label, value, action }: ChargeChannelRowProps) {
  return (
    <li className="flex items-center gap-3 border-border py-3 not-first:border-t">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-sunken text-ink [&_svg]:size-4.5">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-note text-ink-muted">{label}</span>
        <span className="font-semibold text-body-sm text-ink">{value}</span>
      </span>
      {action}
    </li>
  )
}

function overdueNoteOf(late: readonly ListedContact[]): string {
  const since = late
    .map((contact) => contact.overdueSince)
    .filter((date) => date !== null)
    .sort()[0]
  const [only] = late
  if (!only) {
    return desktop.nothingOverdue
  }
  if (!since) {
    return desktop.contactsCount(late.length)
  }
  const date = formatShortDate(since)
  return late.length === 1 ? desktop.overdueOne(only.name, date) : desktop.overdueMany(date)
}

function upcomingLabelOf(item: UpcomingContactItem): string {
  return item.installmentNo !== null && item.installmentCount > 1
    ? desktop.installment(item.description, item.installmentNo, item.installmentCount)
    : item.description
}

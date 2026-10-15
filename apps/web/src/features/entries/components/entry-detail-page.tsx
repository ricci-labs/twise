import { type IsoDate, todayIn } from '@financas/shared'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { Avatar } from '@web/components/display/avatar'
import { CategoryArt } from '@web/components/display/category-art'
import { DetailRow, DetailRows, DetailSection } from '@web/components/display/detail-section'
import { Alert } from '@web/components/feedback/alert'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { AttachArea } from '@web/components/finance/attach-area'
import { EntryHeader } from '@web/components/finance/entry-header'
import { InstallmentRows } from '@web/components/finance/installment-rows'
import { LinkedItem } from '@web/components/finance/linked-item'
import { ShareRows } from '@web/components/finance/share-rows'
import { TransferFlow } from '@web/components/finance/transfer-flow'
import { PageFrame } from '@web/components/layout/page-frame'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import {
  accountsQueryOptions,
  cardInvoicesQueryOptions,
  cardsQueryOptions,
  contactsQueryOptions,
  entryQueryOptions,
  matchedOccurrenceQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { entryDetailOf } from '@web/features/entries/components/entry-detail-view'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  DetailValueViewProps,
  EntryDetailBodyProps,
  EntryDetailPageProps,
  EntryDetailSectionsProps,
  ListedEntry,
} from '@web/features/entries/entries.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { formatMonthTitle } from '@web/lib/format/calendar'
import { hasPermission } from '@web/lib/permissions'
import { queryKeys } from '@web/lib/query-keys'
import { useMemo } from 'react'

const messages = entriesMessages.list.detail
const NOT_FOUND = 'ENTRY_NOT_FOUND'
const TIME_ZONE = 'America/Sao_Paulo'
const NO_CARD = ''

export function EntryDetailPage(props: EntryDetailPageProps) {
  usePageTitle(messages.title)
  const { workspaceId, entryId } = props
  const queryClient = useQueryClient()
  const entry = useQuery({
    ...entryQueryOptions(workspaceId, entryId),
    placeholderData: () =>
      listedEntryOf(
        queryClient.getQueriesData({
          queryKey: [...queryKeys.workspace(workspaceId), 'entries', 'list'],
        }),
        entryId,
      ),
  })
  return (
    <PageFrame className="gap-3 lg:gap-4">
      <SubPageHeader
        title={messages.title}
        backLabel={messages.back}
        back={<Link to="/w/$workspaceId/entries" params={{ workspaceId }} />}
      />
      <EntryDetailState {...props} entry={entry} />
    </PageFrame>
  )
}

function EntryDetailState({
  entry,
  ...props
}: EntryDetailPageProps & { entry: ReturnType<typeof useQuery<ListedEntry>> }) {
  if (entry.error instanceof ApiError && entry.error.code === NOT_FOUND) {
    return (
      <EmptyBlock
        icon="receipt"
        title={messages.notFound}
        text={messages.notFoundText}
        action={
          <Button
            variant="secondary"
            render={
              <Link to="/w/$workspaceId/entries" params={{ workspaceId: props.workspaceId }} />
            }
          >
            {messages.back}
          </Button>
        }
      />
    )
  }
  if (entry.isError && !entry.data) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={entry.error instanceof ApiError ? entry.error.ref : null}
        isRetrying={entry.isFetching}
        onRetry={() => void entry.refetch()}
      />
    )
  }
  if (!entry.data) {
    return <ListSkeleton rows={4} />
  }
  return <EntryDetailBody {...props} entry={entry.data} />
}

function EntryDetailBody(props: EntryDetailBodyProps) {
  const { workspaceId, permissions, entry, memberDirectory } = props
  const cardId = entry.postings.find((posting) => posting.accountKind === 'credit_card')?.accountId
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const contacts = useQuery({
    ...contactsQueryOptions(workspaceId),
    enabled: hasPermission(permissions, 'contacts', 'view') && entry.shares.length > 0,
  })
  const cards = useQuery({ ...cardsQueryOptions(workspaceId), enabled: cardId !== undefined })
  const invoices = useQuery(cardInvoicesQueryOptions(workspaceId, cardId ?? NO_CARD))
  const view = useMemo(
    () =>
      accounts.data &&
      entryDetailOf(entry, {
        accounts: new Map(accounts.data.map((account) => [account.id, account])),
        memberNames: new Map(memberDirectory.map((member) => [member.userId, member.displayName])),
        contactNames: new Map((contacts.data ?? []).map((contact) => [contact.id, contact.name])),
        invoices: new Map((invoices.data ?? []).map((invoice) => [invoice.invoiceId, invoice])),
        card: cards.data?.find((card) => card.accountId === cardId),
        today: todayIn(TIME_ZONE, new Date()) as IsoDate,
      }),
    [entry, accounts.data, memberDirectory, contacts.data, invoices.data, cards.data, cardId],
  )
  if (!view) {
    return <ListSkeleton rows={4} />
  }
  return <EntryDetailSections {...props} view={view} />
}

function EntryDetailSections({ workspaceId, permissions, entry, view }: EntryDetailSectionsProps) {
  const navigate = useNavigate()
  const matched = useQuery({
    ...matchedOccurrenceQueryOptions(workspaceId, entry.id),
    enabled: hasPermission(permissions, 'planning', 'view'),
  })
  const area = (name: string) => (
    <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: name }} />
  )
  return (
    <div className="flex flex-col gap-3">
      {view.isOnClosedInvoice && (
        <Alert tone="info" icon="lock">
          {messages.closedNote}
        </Alert>
      )}
      <EntryHeader {...view.header} />
      {view.shares.length > 0 && (
        <DetailSection
          title={messages.sections.shares}
          action={
            <Button variant="tertiary" size="xs" className="px-0" render={area('contacts')}>
              {messages.seeCharges}
            </Button>
          }
        >
          <ShareRows shares={view.shares} ownCents={view.ownCents} note={messages.sharesNote} />
        </DetailSection>
      )}
      {view.transfer && (
        <DetailSection title={messages.sections.transfer}>
          <TransferFlow from={view.transfer.from} to={view.transfer.to} note={view.note} />
        </DetailSection>
      )}
      <DetailSection title={messages.sections.details}>
        <DetailRows>
          {view.rows.map((row) => (
            <DetailRow key={row.key} label={row.label}>
              <DetailValueView workspaceId={workspaceId} value={row.value} />
            </DetailRow>
          ))}
        </DetailRows>
        {!view.transfer && view.note && (
          <p className="mt-2.5 text-note text-ink-muted">{view.note}</p>
        )}
      </DetailSection>
      {view.installments.rows.length > 0 && view.cardId && (
        <DetailSection title={messages.sections.installments}>
          <InstallmentRows
            start={view.installments.start}
            rows={view.installments.rows.map((row) => ({
              ...row,
              link: (
                <Link
                  to="/w/$workspaceId/cards/$card/invoices/$invoice"
                  params={{ workspaceId, card: view.cardId ?? '', invoice: row.invoiceId }}
                />
              ),
            }))}
          />
        </DetailSection>
      )}
      {matched.data && (
        <LinkedItem
          icon="calendar"
          label={messages.paidBill(
            matched.data.description,
            formatMonthTitle(matched.data.dueOn.slice(0, 7)).toLocaleLowerCase('pt-BR'),
          )}
          link={area('planning')}
        />
      )}
      {entry.notes && (
        <DetailSection title={messages.sections.notes}>
          <p className="text-dialog-text text-ink">{entry.notes}</p>
        </DetailSection>
      )}
      <DetailSection title={messages.sections.attachments}>
        {hasPermission(permissions, 'attachments', 'create') ? (
          <AttachArea
            onPress={() =>
              void navigate({
                to: '/w/$workspaceId/$area',
                params: { workspaceId, area: 'attachments' },
              })
            }
          />
        ) : (
          <p className="text-body-sm text-ink-muted">{messages.noAttachments}</p>
        )}
      </DetailSection>
      {hasPermission(permissions, 'audit', 'view') && (
        <LinkedItem icon="history" label={messages.history} link={area('history')} />
      )}
    </div>
  )
}

function DetailValueView({ workspaceId, value }: DetailValueViewProps) {
  if (value.kind === 'art') {
    return (
      <>
        <CategoryArt name={value.name} icon={value.icon} size="sm" />
        {value.name}
      </>
    )
  }
  if (value.kind === 'member') {
    return (
      <>
        <Avatar name={value.name} size="xs" />
        {value.name}
      </>
    )
  }
  if (value.kind === 'invoice') {
    return (
      <Link
        to="/w/$workspaceId/cards/$card/invoices/$invoice"
        params={{ workspaceId, card: value.cardId, invoice: value.invoiceId }}
        className="font-semibold text-mint-ink underline underline-offset-4"
      >
        {value.text}
      </Link>
    )
  }
  return value.text
}

function listedEntryOf(lists: [unknown, unknown][], entryId: string): ListedEntry | undefined {
  for (const [, data] of lists) {
    const pages = (data as { pages?: { items: ListedEntry[] }[] } | undefined)?.pages ?? []
    for (const page of pages) {
      const found = page.items.find((item) => item.id === entryId)
      if (found) {
        return found
      }
    }
  }
  return undefined
}

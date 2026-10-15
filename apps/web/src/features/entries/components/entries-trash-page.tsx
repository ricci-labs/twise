import { type IsoDate, todayIn } from '@financas/shared'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { Card } from '@web/components/display/card'
import { DataTable, DataTableName } from '@web/components/display/data-table'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { EntryAmount } from '@web/components/finance/entry-row'
import { TrashRow } from '@web/components/finance/trash-row'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import { TrashTabs } from '@web/components/navigation/trash-tabs'
import {
  accountsQueryOptions,
  trashedEntriesQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { entryRowOf } from '@web/features/entries/components/entry-row-view'
import { deletedLineOf } from '@web/features/entries/components/trashed-entry-line'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  EntriesTrashBodyProps,
  EntriesTrashListProps,
  EntriesTrashPageProps,
  EntriesTrashRowsProps,
} from '@web/features/entries/entries.types'
import { useEntryRestore } from '@web/features/entries/hooks/use-entry-restore'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'
import { useMemo } from 'react'

const messages = entriesMessages.list.trashPage
const TIME_ZONE = 'America/Sao_Paulo'
const TABLE_COLUMNS = [
  { key: 'entry', label: messages.table.entry },
  { key: 'deleted', label: messages.table.deleted },
  { key: 'reason', label: messages.table.reason },
  { key: 'amount', label: messages.table.amount, align: 'end' },
  { key: 'actions', label: messages.table.actions, isLabelHidden: true, align: 'end' },
] as const

export function EntriesTrashPage(props: EntriesTrashPageProps) {
  usePageTitle(messages.pageTitle)
  const { workspaceId, permissions } = props
  const navigate = useNavigate()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const canDelete = hasPermission(permissions, 'entries', 'delete')
  return (
    <PageFrame className="gap-3 lg:gap-4">
      {isDesktop ? (
        <PageHeader title={messages.title} description={messages.desktopDescription} />
      ) : (
        <SubPageHeader
          title={messages.title}
          backLabel={messages.back}
          back={<Link to="/w/$workspaceId/entries" params={{ workspaceId }} />}
        />
      )}
      {hasPermission(permissions, 'accounts', 'delete') && (
        <TrashTabs
          value="entries"
          className="lg:w-90 lg:self-start"
          onChange={(tab) =>
            tab === 'accounts' &&
            void navigate({ to: '/w/$workspaceId/accounts/trash', params: { workspaceId } })
          }
        />
      )}
      {canDelete && !isDesktop && (
        <p className="text-note text-ink-muted">{messages.description}</p>
      )}
      {canDelete ? (
        <EntriesTrashBody {...props} isDesktop={isDesktop} />
      ) : (
        <EmptyBlock icon="receipt" title={messages.noAccess} />
      )}
    </PageFrame>
  )
}

function EntriesTrashBody({ isDesktop, ...props }: EntriesTrashBodyProps) {
  const trash = useInfiniteQuery(trashedEntriesQueryOptions(props.workspaceId))
  const accounts = useQuery(accountsQueryOptions(props.workspaceId))
  const failed = [trash, accounts].find((query) => query.isError)
  if (failed && !trash.data) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={failed.error instanceof ApiError ? failed.error.ref : null}
        isRetrying={failed.isFetching}
        onRetry={() => void failed.refetch()}
      />
    )
  }
  if (!trash.data || !accounts.data) {
    return <ListSkeleton rows={3} />
  }
  const entries = trash.data.pages.flatMap((page) => page.items)
  if (entries.length === 0) {
    return <EmptyBlock icon="receipt" title={messages.empty} text={messages.emptyText} />
  }
  const found = (
    <>
      <EntriesTrashList {...props} entries={entries} accounts={accounts.data} />
      {trash.hasNextPage && (
        <ShowMoreButton
          isLoading={trash.isFetchingNextPage}
          onClick={() => void trash.fetchNextPage()}
        />
      )}
    </>
  )
  if (!isDesktop) {
    return found
  }
  return (
    <Card title={messages.tableTitle} description={messages.tableDescription}>
      {found}
    </Card>
  )
}

function EntriesTrashList({
  workspaceId,
  currentUserId,
  memberDirectory,
  entries,
  accounts,
}: EntriesTrashListProps) {
  const { busyId, restore } = useEntryRestore(workspaceId)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const rows = useMemo(() => {
    const context = {
      accounts: new Map(accounts.map((account) => [account.id, account])),
      memberNames: new Map(memberDirectory.map((member) => [member.userId, member.displayName])),
      currentUserId,
    }
    return entries.map((entry) => ({
      entry,
      row: entryRowOf(entry, context),
      deletedBy: entry.deletedByUserId ? context.memberNames.get(entry.deletedByUserId) : undefined,
    }))
  }, [entries, accounts, memberDirectory, currentUserId])
  const Rows = isDesktop ? EntriesTrashTable : EntriesTrashRows
  return <Rows rows={rows} busyId={busyId} onRestore={restore} />
}

function EntriesTrashRows({ rows, busyId, onRestore }: EntriesTrashRowsProps) {
  const today = todayIn(TIME_ZONE, new Date()) as IsoDate
  return (
    <ul className="rounded-xl border border-border bg-surface px-3">
      {rows.map(({ entry, row, deletedBy }) => (
        <TrashRow
          key={entry.id}
          isStacked
          name={entry.description}
          icon={row.art.icon}
          amount={<EntryAmount amountCents={entry.amountCents} direction={row.direction} />}
          details={[row.detail, deletedLineOf(String(entry.deletedAt), deletedBy, today)]}
          note={entry.deleteReason ? messages.reason(entry.deleteReason) : null}
          actionLabel={messages.restore}
          actionAccessibleLabel={messages.restoreLabel(entry.description)}
          isBusy={busyId === entry.id}
          onAction={() => onRestore(entry)}
        />
      ))}
    </ul>
  )
}

function EntriesTrashTable({ rows, busyId, onRestore }: EntriesTrashRowsProps) {
  const today = todayIn(TIME_ZONE, new Date()) as IsoDate
  return (
    <DataTable
      label={messages.tableTitle}
      layout="trash"
      columns={TABLE_COLUMNS}
      rows={rows.map(({ entry, row, deletedBy }) => ({
        key: entry.id,
        cells: [
          <DataTableName
            key="entry"
            name={entry.description}
            artName={row.art.name}
            icon={row.art.icon}
            detail={row.detail}
          />,
          deletedLineOf(String(entry.deletedAt), deletedBy, today, messages.deletedCell),
          entry.deleteReason ? sentenceOf(entry.deleteReason) : entriesMessages.list.none,
          <EntryAmount
            key="amount"
            amountCents={entry.amountCents}
            direction={row.direction}
            className="text-choice"
          />,
          <Button
            key="restore"
            variant="secondary"
            size="sm"
            aria-label={messages.restoreLabel(entry.description)}
            isLoading={busyId === entry.id}
            onClick={() => onRestore(entry)}
          >
            <TwiseIcon name="restore" />
            {messages.restore}
          </Button>,
        ],
      }))}
    />
  )
}

function sentenceOf(text: string): string {
  return text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1)
}

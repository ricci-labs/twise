import { type IsoDate, todayIn } from '@financas/shared'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { Amount } from '@web/components/display/amount'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { showToast } from '@web/components/feedback/toast'
import { TrashRow } from '@web/components/finance/trash-row'
import { PageFrame } from '@web/components/layout/page-frame'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import { TrashTabs } from '@web/components/navigation/trash-tabs'
import {
  accountsQueryOptions,
  trashedEntriesQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { useEntryAction } from '@web/features/entries/api/use-entry-action'
import { entryRowOf } from '@web/features/entries/components/entry-row-view'
import {
  deletedLineOf,
  restoreRefusalOf,
} from '@web/features/entries/components/trashed-entry-line'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  EntriesTrashListProps,
  EntriesTrashPageProps,
  TrashedEntry,
} from '@web/features/entries/entries.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { hasPermission } from '@web/lib/permissions'
import { useMemo, useState } from 'react'

const messages = entriesMessages.list.trashPage
const TIME_ZONE = 'America/Sao_Paulo'
const AMOUNT_TONES = { out: 'text-ink', in: 'text-mint-ink', neutral: 'text-ink-muted' } as const

export function EntriesTrashPage(props: EntriesTrashPageProps) {
  usePageTitle(messages.pageTitle)
  const { workspaceId, permissions } = props
  const navigate = useNavigate()
  return (
    <PageFrame className="gap-3 lg:gap-4">
      <SubPageHeader
        title={messages.title}
        backLabel={messages.back}
        back={<Link to="/w/$workspaceId/entries" params={{ workspaceId }} />}
      />
      {hasPermission(permissions, 'accounts', 'delete') && (
        <TrashTabs
          value="entries"
          onChange={(tab) =>
            tab === 'accounts' &&
            void navigate({ to: '/w/$workspaceId/accounts/trash', params: { workspaceId } })
          }
        />
      )}
      {hasPermission(permissions, 'entries', 'delete') ? (
        <>
          <p className="text-note text-ink-muted">{messages.description}</p>
          <EntriesTrashBody {...props} />
        </>
      ) : (
        <EmptyBlock icon="receipt" title={messages.noAccess} />
      )}
    </PageFrame>
  )
}

function EntriesTrashBody(props: EntriesTrashPageProps) {
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
  return (
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
}

function EntriesTrashList({
  workspaceId,
  currentUserId,
  memberDirectory,
  entries,
  accounts,
}: EntriesTrashListProps) {
  const action = useEntryAction(workspaceId)
  const navigate = useNavigate()
  const [busyId, setBusyId] = useState<string | null>(null)
  const today = todayIn(TIME_ZONE, new Date()) as IsoDate
  const context = useMemo(
    () => ({
      accounts: new Map(accounts.map((account) => [account.id, account])),
      memberNames: new Map(memberDirectory.map((member) => [member.userId, member.displayName])),
      currentUserId,
    }),
    [accounts, memberDirectory, currentUserId],
  )

  async function restore(entry: TrashedEntry, accountFirst?: string) {
    setBusyId(entry.id)
    try {
      if (accountFirst) {
        await action.mutateAsync({ action: 'restoreAccount', accountId: accountFirst })
      }
      await action.mutateAsync({ action: 'restore', entryId: entry.id })
      showToast(messages.restored, {
        tone: 'success',
        action: {
          label: messages.see,
          onPress: () =>
            void navigate({
              to: '/w/$workspaceId/entries/$entry',
              params: { workspaceId, entry: entry.id },
            }),
        },
      })
    } catch (error) {
      refused(entry, error)
    } finally {
      setBusyId(null)
    }
  }

  function refused(entry: TrashedEntry, error: unknown) {
    const refusal = restoreRefusalOf(error)
    const account = refusal?.account
    showToast(refusal?.message ?? errorMessageFor(error), {
      tone: 'danger',
      action: account && {
        label: messages.restoreAccount(account.name),
        onPress: () => void restore(entry, account.id),
      },
    })
  }

  return (
    <ul className="rounded-xl border border-border bg-surface px-3">
      {entries.map((entry) => {
        const row = entryRowOf(entry, context)
        const deletedBy = entry.deletedByUserId
          ? context.memberNames.get(entry.deletedByUserId)
          : undefined
        return (
          <TrashRow
            key={entry.id}
            isStacked
            name={entry.description}
            icon={row.art.icon}
            amount={
              <Amount
                cents={(row.direction === 'out' ? -1 : 1) * entry.amountCents}
                sign={row.direction === 'in' ? 'always' : 'auto'}
                size="inherit"
                className={`shrink-0 font-emphasis ${AMOUNT_TONES[row.direction]}`}
              />
            }
            details={[row.detail, deletedLineOf(String(entry.deletedAt), deletedBy, today)]}
            note={entry.deleteReason ? messages.reason(entry.deleteReason) : null}
            actionLabel={messages.restore}
            actionAccessibleLabel={messages.restoreLabel(entry.description)}
            isBusy={busyId === entry.id}
            onAction={() => void restore(entry)}
          />
        )
      })}
    </ul>
  )
}

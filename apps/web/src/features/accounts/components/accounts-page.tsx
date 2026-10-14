import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { KpiSkeleton } from '@web/components/feedback/kpi-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { AccountGroup } from '@web/components/finance/account-group'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  AccountsBodyProps,
  AccountsLoadedProps,
  AccountsPageProps,
} from '@web/features/accounts/accounts.types'
import {
  accountsQueryOptions,
  accountsSummaryQueryOptions,
  balancesQueryOptions,
  cardsQueryOptions,
  membersQueryOptions,
} from '@web/features/accounts/api/accounts.queries'
import { AccountsAreaHeader } from '@web/features/accounts/components/accounts-area-header'
import { AccountsLists } from '@web/features/accounts/components/accounts-lists'
import { AccountsSummaryCards } from '@web/features/accounts/components/accounts-summary-cards'
import { listedAccountsOf } from '@web/features/accounts/components/listed-accounts'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { hasPermission } from '@web/lib/permissions'
import { Plus } from 'lucide-react'
import { useEffect } from 'react'

const NO_CARDS: never[] = []

const HIGHLIGHT_MS = 4000

export function AccountsPage({
  workspaceId,
  permissions,
  createdId,
  onCreatedSeen,
}: AccountsPageProps) {
  usePageTitle(accountsMessages.pageTitle)
  useEffect(() => {
    if (!createdId) {
      return
    }
    const timer = setTimeout(onCreatedSeen, HIGHLIGHT_MS)
    return () => clearTimeout(timer)
  }, [createdId, onCreatedSeen])
  return (
    <div className="mx-auto flex w-full max-w-160 flex-col gap-4 px-4 pt-2 pb-6 lg:max-w-296 lg:gap-5 lg:px-8 lg:pt-7 lg:pb-12">
      <AccountsAreaHeader
        workspaceId={workspaceId}
        current="accounts"
        canSeeTrash={hasPermission(permissions, 'accounts', 'delete')}
        newItem={
          hasPermission(permissions, 'accounts', 'create')
            ? {
                label: accountsMessages.groups.newAccount,
                link: <Link to="." search={(previous) => ({ ...previous, account: 'new' })} />,
              }
            : undefined
        }
      />
      <AccountsBody workspaceId={workspaceId} permissions={permissions} highlightedId={createdId} />
    </div>
  )
}

function AccountsBody({ workspaceId, permissions, highlightedId }: AccountsBodyProps) {
  const canSeeCards = hasPermission(permissions, 'cards', 'view')
  const canSeeMembers = hasPermission(permissions, 'members', 'view')
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const balances = useQuery(balancesQueryOptions(workspaceId))
  const summary = useQuery(accountsSummaryQueryOptions(workspaceId))
  const cards = useQuery({ ...cardsQueryOptions(workspaceId), enabled: canSeeCards })
  const members = useQuery({ ...membersQueryOptions(workspaceId), enabled: canSeeMembers })
  const required = [accounts, balances, summary, ...(canSeeCards ? [cards] : [])]
  const failed = required.find((query) => query.isError)

  if (failed) {
    return (
      <SectionError
        message={accountsMessages.failed}
        errorRef={failed.error instanceof ApiError ? failed.error.ref : null}
        isRetrying={required.some((query) => query.isFetching)}
        onRetry={() => {
          for (const query of required) {
            if (query.isError) {
              void query.refetch()
            }
          }
        }}
      />
    )
  }
  if (!accounts.data || !balances.data || !summary.data || (canSeeCards && !cards.data)) {
    return <AccountsLoading />
  }
  return (
    <AccountsLoaded
      workspaceId={workspaceId}
      permissions={permissions}
      highlightedId={highlightedId}
      summary={summary.data}
      data={{
        accounts: accounts.data,
        balances: balances.data,
        cards: cards.data ?? NO_CARDS,
        members: members.data ?? null,
      }}
    />
  )
}

function AccountsLoaded({
  workspaceId,
  permissions,
  data,
  summary,
  highlightedId,
}: AccountsLoadedProps) {
  const listed = listedAccountsOf(data)
  if (listed.length === 0) {
    return (
      <EmptyBlock
        icon="wallet"
        title={accountsMessages.empty.title}
        text={accountsMessages.empty.text}
        action={
          hasPermission(permissions, 'accounts', 'create') && (
            <Button
              render={<Link to="." search={(previous) => ({ ...previous, account: 'new' })} />}
            >
              <Plus aria-hidden="true" />
              {accountsMessages.empty.action}
            </Button>
          )
        }
      />
    )
  }
  const cardNames = new Map(data.accounts.map((account) => [account.id, account.name]))
  return (
    <>
      <div className="-mx-4 lg:mx-0">
        <AccountsSummaryCards summary={summary} cardNames={cardNames} />
      </div>
      <AccountsLists
        workspaceId={workspaceId}
        permissions={permissions}
        accounts={listed}
        highlightedId={highlightedId}
      />
    </>
  )
}

function AccountsLoading() {
  return (
    <>
      <KpiSkeleton />
      <AccountGroup title={accountsMessages.groups.money} loadingRows={3} />
      <AccountGroup title={accountsMessages.groups.cards} loadingRows={2} />
    </>
  )
}

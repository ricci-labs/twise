import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { SectionError } from '@web/components/feedback/section-error'
import { AccountGroup } from '@web/components/finance/account-group'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { TextInput } from '@web/components/inputs/text-input'
import { PageFrame } from '@web/components/layout/page-frame'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  CategoriesBodyProps,
  CategoriesLoadedProps,
  CategoriesPageProps,
  CategoriesShownProps,
  CategoryKind,
} from '@web/features/accounts/accounts.types'
import { accountsQueryOptions } from '@web/features/accounts/api/accounts.queries'
import { AccountsAreaHeader } from '@web/features/accounts/components/accounts-area-header'
import { CategoryList } from '@web/features/accounts/components/category-list'
import { CategoryTables } from '@web/features/accounts/components/category-tables'
import {
  activeCategoryCount,
  categoriesMatching,
  categoryTreeOf,
} from '@web/features/accounts/components/category-tree'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { CATEGORIES_SEARCH_ABOVE } from '@web/lib/long-lists'
import { hasPermission } from '@web/lib/permissions'
import { Search } from 'lucide-react'
import { useState } from 'react'

const messages = accountsMessages.categories
const KIND_OPTIONS = [
  { value: 'expense', label: messages.kinds.expense },
  { value: 'income', label: messages.kinds.income },
]

export function CategoriesPage({ workspaceId, permissions, kind, createdId }: CategoriesPageProps) {
  usePageTitle(accountsMessages.pageTitle)
  const navigate = useNavigate()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  return (
    <PageFrame className="gap-4 lg:gap-5">
      <AccountsAreaHeader
        workspaceId={workspaceId}
        current="categories"
        canSeeTrash={hasPermission(permissions, 'accounts', 'delete')}
        newItem={
          hasPermission(permissions, 'accounts', 'create')
            ? {
                label: accountsMessages.categoryForm.newCategory,
                link: <Link to="." search={(previous) => ({ ...previous, category: 'new' })} />,
              }
            : undefined
        }
      />
      {!isDesktop && (
        <ChoiceChips
          className="mb-1"
          label={messages.kinds.label}
          options={KIND_OPTIONS}
          value={kind}
          onSelect={(next) =>
            navigate({ to: '.', search: { kind: next as CategoryKind }, replace: true })
          }
        />
      )}
      {!isDesktop && kind === 'income' && (
        <p className="-mt-0.5 mb-2.5 px-0.5 text-group-note text-ink-muted">
          {messages.incomeNote}
        </p>
      )}
      <CategoriesBody
        workspaceId={workspaceId}
        permissions={permissions}
        kind={kind}
        createdId={createdId}
        isDesktop={isDesktop}
      />
    </PageFrame>
  )
}

function CategoriesBody({
  workspaceId,
  permissions,
  kind,
  createdId,
  isDesktop,
}: CategoriesBodyProps) {
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  if (accounts.isError) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={accounts.error instanceof ApiError ? accounts.error.ref : null}
        isRetrying={accounts.isFetching}
        onRetry={() => void accounts.refetch()}
      />
    )
  }
  if (!accounts.data) {
    return <AccountGroup title={messages.groups[kind]} loadingRows={4} />
  }
  return (
    <CategoriesLoaded
      workspaceId={workspaceId}
      permissions={permissions}
      kind={kind}
      createdId={createdId}
      isDesktop={isDesktop}
      accounts={accounts.data}
    />
  )
}

function CategoriesLoaded({ accounts, ...body }: CategoriesLoadedProps) {
  const [search, setSearch] = useState('')
  const count = activeCategoryCount(accounts, body.isDesktop ? undefined : body.kind)
  const hasSearch = count > CATEGORIES_SEARCH_ABOVE
  const isSearching = hasSearch && search.trim() !== ''
  return (
    <>
      {hasSearch && (
        <TextInput
          type="search"
          aria-label={messages.search}
          placeholder={messages.search}
          startAdornment={<Search aria-hidden="true" />}
          className="min-h-touch lg:max-w-90"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      )}
      <CategoriesShown
        {...body}
        accounts={isSearching ? categoriesMatching(accounts, search) : accounts}
        isSearching={isSearching}
      />
    </>
  )
}

function CategoriesShown({
  workspaceId,
  permissions,
  kind,
  createdId,
  isDesktop,
  accounts,
  isSearching,
}: CategoriesShownProps) {
  if (isDesktop) {
    return (
      <CategoryTables
        workspaceId={workspaceId}
        permissions={permissions}
        accounts={accounts}
        createdId={createdId}
        isSearching={isSearching}
      />
    )
  }
  const tree = categoryTreeOf(accounts, kind)
  if (tree.active.length === 0 && tree.archivedCount === 0) {
    return isSearching ? (
      <p className="px-0.5 text-body-sm text-ink-muted">{messages.nothingFound}</p>
    ) : (
      <EmptyBlock icon="groceries" title={messages.empty[kind]} />
    )
  }
  return (
    <CategoryList
      workspaceId={workspaceId}
      permissions={permissions}
      tree={tree}
      kind={kind}
      createdId={createdId}
      isSearching={isSearching}
    />
  )
}

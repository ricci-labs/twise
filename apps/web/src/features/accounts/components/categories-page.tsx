import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { SectionError } from '@web/components/feedback/section-error'
import { AccountGroup } from '@web/components/finance/account-group'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  CategoriesBodyProps,
  CategoriesPageProps,
  CategoryKind,
} from '@web/features/accounts/accounts.types'
import { accountsQueryOptions } from '@web/features/accounts/api/accounts.queries'
import { AccountsAreaHeader } from '@web/features/accounts/components/accounts-area-header'
import { CategoryList } from '@web/features/accounts/components/category-list'
import { CategoryTables } from '@web/features/accounts/components/category-tables'
import { categoryTreeOf } from '@web/features/accounts/components/category-tree'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'

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
    <div className="mx-auto flex w-full max-w-160 flex-col gap-4 px-4 pt-2 pb-6 lg:max-w-296 lg:gap-5 lg:px-8 lg:pt-7 lg:pb-12">
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
    </div>
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
  if (isDesktop) {
    return (
      <CategoryTables
        workspaceId={workspaceId}
        permissions={permissions}
        accounts={accounts.data}
        createdId={createdId}
      />
    )
  }
  const tree = categoryTreeOf(accounts.data, kind)
  if (tree.active.length === 0 && tree.archivedCount === 0) {
    return <EmptyBlock icon="groceries" title={messages.empty[kind]} />
  }
  return (
    <CategoryList
      workspaceId={workspaceId}
      permissions={permissions}
      tree={tree}
      kind={kind}
      createdId={createdId}
    />
  )
}

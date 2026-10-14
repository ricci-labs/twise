import { useQuery } from '@tanstack/react-query'
import type {
  CategoryEditorProps,
  CategoryFormInput,
  CategoryKind,
  CategoryNode,
} from '@web/features/accounts/accounts.types'
import { accountsQueryOptions } from '@web/features/accounts/api/accounts.queries'
import { CategoryForm } from '@web/features/accounts/components/category-form'
import { categoryTreeOf } from '@web/features/accounts/components/category-tree'
import { hasPermission } from '@web/lib/permissions'

const NEW_CATEGORY = 'new'

export function CategoryEditor({
  workspaceId,
  permissions,
  param,
  parentParam,
  kindParam,
  onClose,
  onCreated,
}: CategoryEditorProps) {
  const action = param === NEW_CATEGORY ? 'create' : 'update'
  const isAllowed = param !== undefined && hasPermission(permissions, 'accounts', action)
  const accounts = useQuery({ ...accountsQueryOptions(workspaceId), enabled: isAllowed }).data
  if (!isAllowed || !accounts) {
    return null
  }
  const mains = {
    expense: categoryTreeOf(accounts, 'expense').active,
    income: categoryTreeOf(accounts, 'income').active,
  }
  const all = [...mains.expense, ...mains.income].flatMap((main) => [main, ...main.children])
  if (param === NEW_CATEGORY) {
    const parent = all.find((node) => node.id === parentParam && node.parentId === null)
    return (
      <CategoryForm
        workspaceId={workspaceId}
        mode={{ kind: 'create' }}
        mains={mains}
        defaults={blankCategory(parent?.kind ?? kindParam ?? 'expense', parent)}
        onClose={onClose}
        onCreated={onCreated}
      />
    )
  }
  const node = all.find((candidate) => candidate.id === param)
  if (!node) {
    return null
  }
  return (
    <CategoryForm
      key={node.id}
      workspaceId={workspaceId}
      mode={{ kind: 'edit', node }}
      mains={mains}
      defaults={defaultsOf(node)}
      onClose={onClose}
      onCreated={onCreated}
    />
  )
}

function blankCategory(kind: CategoryKind, parent: CategoryNode | undefined): CategoryFormInput {
  return {
    kind,
    name: '',
    incomeNature: '',
    parentId: parent?.id ?? '',
    icon: parent?.icon ?? '',
    color: '',
  }
}

function defaultsOf(node: CategoryNode): CategoryFormInput {
  return {
    kind: node.kind,
    name: node.name,
    incomeNature:
      node.incomeNature === 'fixed' || node.incomeNature === 'variable' ? node.incomeNature : '',
    parentId: node.parentId ?? '',
    icon: node.icon ?? '',
    color: node.color ?? '',
  }
}

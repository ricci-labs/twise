import { Link } from '@tanstack/react-router'
import { ArchivedToggle } from '@web/components/display/archived-toggle'
import { Card } from '@web/components/display/card'
import { DataTable, type DataTableColumn, DataTableName } from '@web/components/display/data-table'
import { SubcategoryAddChip } from '@web/components/finance/subcategory-add-chip'
import { SubcategoryChip } from '@web/components/finance/subcategory-chip'
import { SubcategoryChips } from '@web/components/finance/subcategory-chips'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  CategoryChipsCellProps,
  CategoryTableProps,
  CategoryTablesProps,
  CategoryTree,
} from '@web/features/accounts/accounts.types'
import { CategoryActions } from '@web/features/accounts/components/category-actions'
import { NatureBadge, Subcategory } from '@web/features/accounts/components/category-list'
import { categoryTreeOf } from '@web/features/accounts/components/category-tree'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = accountsMessages.categories
const table = messages.table
const columns = table.columns

const EXPENSE_COLUMNS: readonly DataTableColumn[] = [
  { key: 'name', label: columns.category },
  { key: 'subcategories', label: columns.subcategories },
  { key: 'actions', label: columns.actions, isLabelHidden: true, isActions: true },
]

const INCOME_COLUMNS: readonly DataTableColumn[] = [
  { key: 'name', label: columns.category },
  { key: 'nature', label: columns.nature },
  { key: 'subcategories', label: columns.subcategories },
  { key: 'actions', label: columns.actions, isLabelHidden: true, isActions: true },
]

export function CategoryTables({
  workspaceId,
  permissions,
  accounts,
  createdId,
}: CategoryTablesProps) {
  const expense = categoryTreeOf(accounts, 'expense')
  const income = categoryTreeOf(accounts, 'income')
  const shared = { workspaceId, permissions, createdId }
  return (
    <div className="flex flex-col gap-5">
      <Card title={messages.kinds.expense} description={summaryOf(expense)}>
        <CategoryTable {...shared} tree={expense} kind="expense" />
      </Card>
      <Card title={messages.kinds.income} description={messages.incomeNote}>
        <CategoryTable {...shared} tree={income} kind="income" />
      </Card>
      <ArchivedToggle count={expense.archivedCount + income.archivedCount}>
        <Card title={accountsMessages.archivedTitle}>
          <DataTable
            label={accountsMessages.archivedTitle}
            layout="categories"
            columns={EXPENSE_COLUMNS}
            rows={[
              ...archivedRowsOf(expense, workspaceId, permissions),
              ...archivedRowsOf(income, workspaceId, permissions),
            ]}
          />
        </Card>
      </ArchivedToggle>
    </div>
  )
}

function CategoryTable({ workspaceId, permissions, tree, kind, createdId }: CategoryTableProps) {
  const createdParent = tree.active.find((main) =>
    main.children.some((child) => child.id === createdId),
  )
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(createdParent ? [createdParent.id] : []),
  )
  const [hidden, setHidden] = useState<Readonly<Record<string, number>>>({})
  if (tree.active.length === 0) {
    return <p className="text-body-sm text-ink-muted">{messages.empty[kind]}</p>
  }
  const shared = { workspaceId, permissions, tree }
  const setExpandedOf = (id: string, isExpanded: boolean) =>
    setExpanded((previous) => {
      const next = new Set(previous)
      if (isExpanded) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  const setHiddenOf = (id: string, count: number) =>
    setHidden((previous) => (previous[id] === count ? previous : { ...previous, [id]: count }))
  const rows = tree.active.map((node) => {
    const hiddenCount = hidden[node.id] ?? 0
    const isExpanded = expanded.has(node.id)
    const chips = (
      <CategoryChipsCell
        key="subcategories"
        {...shared}
        node={node}
        isExpanded={isExpanded}
        onExpandedChange={(next) => setExpandedOf(node.id, next)}
        onHiddenCountChange={(count) => setHiddenOf(node.id, count)}
      />
    )
    return {
      key: node.id,
      isOpen: isExpanded && hiddenCount > 0,
      cells: [
        <DataTableName
          key="name"
          name={node.name}
          icon={node.icon}
          detail={hiddenCount > 0 ? table.subcategoryCount(node.children.length) : undefined}
        />,
        ...(kind === 'income' ? [<NatureBadge key="nature" node={node} />] : []),
        chips,
        <CategoryActions key="actions" {...shared} node={node} />,
      ],
    }
  })
  return (
    <DataTable
      label={messages.kinds[kind]}
      layout={kind === 'income' ? 'incomes' : 'categories'}
      columns={kind === 'income' ? INCOME_COLUMNS : EXPENSE_COLUMNS}
      rows={rows}
    />
  )
}

function CategoryChipsCell({
  workspaceId,
  permissions,
  tree,
  node,
  isExpanded,
  onExpandedChange,
  onHiddenCountChange,
}: CategoryChipsCellProps) {
  const children = node.children
  const add = hasPermission(permissions, 'accounts', 'create') ? (
    <SubcategoryAddChip
      label={accountsMessages.categoryForm.addSubcategory(node.name)}
      text={children.length === 0 ? table.addSubcategory : undefined}
      link={
        <Link to="." search={(previous) => ({ ...previous, category: 'new', parent: node.id })} />
      }
    />
  ) : undefined
  return (
    <SubcategoryChips
      labels={children.map((child) => child.name)}
      chips={children.map((child) => (
        <Subcategory
          key={child.id}
          workspaceId={workspaceId}
          permissions={permissions}
          tree={tree}
          node={child}
        />
      ))}
      add={add}
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
      onHiddenCountChange={onHiddenCountChange}
    />
  )
}

function archivedRowsOf(
  tree: CategoryTree,
  workspaceId: string,
  permissions: CategoryTablesProps['permissions'],
) {
  return tree.archived.map((node) => ({
    key: node.id,
    cells: [
      <DataTableName
        key="name"
        name={node.name}
        icon={node.icon}
        detail={node.children.length > 0 ? messages.kindNames[node.kind] : node.detail}
      />,
      <span key="subcategories" className="flex flex-wrap gap-1.5 py-1.5">
        {node.children.map((child) => (
          <SubcategoryChip key={child.id} label={child.name} tone="archived" />
        ))}
      </span>,
      <CategoryActions
        key="actions"
        workspaceId={workspaceId}
        permissions={permissions}
        tree={tree}
        node={node}
      />,
    ],
  }))
}

function summaryOf(tree: CategoryTree): string {
  const subcategories = tree.active.reduce((total, main) => total + main.children.length, 0)
  return table.summary(tree.active.length, subcategories)
}

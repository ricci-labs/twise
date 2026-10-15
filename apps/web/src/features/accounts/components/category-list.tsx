import { Link } from '@tanstack/react-router'
import { ArchivedToggle } from '@web/components/display/archived-toggle'
import { Badge } from '@web/components/display/badge'
import { AccountGroup } from '@web/components/finance/account-group'
import { CategoryRow } from '@web/components/finance/category-row'
import { SubcategoryAddChip } from '@web/components/finance/subcategory-add-chip'
import { SubcategoryChip } from '@web/components/finance/subcategory-chip'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  AddSubcategoryProps,
  CategoryListProps,
  CategoryNodeProps,
  NatureBadgeProps,
} from '@web/features/accounts/accounts.types'
import { CategoryActions } from '@web/features/accounts/components/category-actions'
import { useRememberedIds } from '@web/hooks/use-remembered-ids'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = accountsMessages.categories

export function CategoryList({
  workspaceId,
  permissions,
  tree,
  kind,
  createdId,
  isSearching = false,
}: CategoryListProps) {
  const open = useRememberedIds(`openCategories:${workspaceId}`)
  const canCreate = hasPermission(permissions, 'accounts', 'create')
  const createdParent = tree.active.find((main) =>
    main.children.some((child) => child.id === createdId),
  )
  const [openedFor, setOpenedFor] = useState<string | undefined>()
  if (createdId && createdId !== openedFor && createdParent) {
    setOpenedFor(createdId)
    open.setRemembered(createdParent.id, true)
  }
  const shared = { workspaceId, permissions, tree }
  return (
    <>
      <AccountGroup
        title={messages.groups[kind]}
        add={
          canCreate
            ? {
                label: accountsMessages.categoryForm.newCategory,
                link: <Link to="." search={(previous) => ({ ...previous, category: 'new' })} />,
              }
            : undefined
        }
      >
        {tree.active.map((node) => (
          <CategoryRow
            key={node.id}
            name={node.name}
            icon={node.icon}
            badge={<NatureBadge node={node} />}
            subcategoryCount={node.children.length}
            isOpen={open.ids.has(node.id) || (isSearching && node.children.length > 0)}
            onOpenChange={(isOpen) => open.setRemembered(node.id, isOpen)}
            add={
              canCreate && node.children.length === 0 ? (
                <AddSubcategory parent={node} text={messages.table.addSubcategory} />
              ) : undefined
            }
            actions={<CategoryActions {...shared} node={node} />}
          >
            {node.children.map((child) => (
              <Subcategory key={child.id} {...shared} node={child} />
            ))}
            {canCreate && node.children.length > 0 && <AddSubcategory parent={node} />}
          </CategoryRow>
        ))}
      </AccountGroup>
      <ArchivedToggle count={tree.archivedCount}>
        <AccountGroup>
          {tree.archived.map((node) => (
            <CategoryRow
              key={node.id}
              name={node.name}
              icon={node.icon}
              detail={node.detail}
              actions={<CategoryActions {...shared} node={node} />}
            >
              {node.children.length > 0 &&
                node.children.map((child) => (
                  <SubcategoryChip key={child.id} label={child.name} tone="archived" />
                ))}
            </CategoryRow>
          ))}
        </AccountGroup>
      </ArchivedToggle>
    </>
  )
}

function AddSubcategory({ parent, text }: AddSubcategoryProps) {
  return (
    <SubcategoryAddChip
      label={accountsMessages.categoryForm.addSubcategory(parent.name)}
      text={text}
      link={
        <Link to="." search={(previous) => ({ ...previous, category: 'new', parent: parent.id })} />
      }
    />
  )
}

export function Subcategory({ workspaceId, permissions, tree, node }: CategoryNodeProps) {
  const parent = tree.active.find((main) => main.id === node.parentId)
  const canAct =
    hasPermission(permissions, 'accounts', 'update') ||
    hasPermission(permissions, 'accounts', 'delete')
  if (!canAct || !parent) {
    return <SubcategoryChip label={node.name} tone="plain" />
  }
  return (
    <CategoryActions
      workspaceId={workspaceId}
      permissions={permissions}
      tree={tree}
      node={node}
      description={messages.subcategoryOf(parent.name)}
      trigger={
        <SubcategoryChip label={node.name} aria-label={messages.chip(node.name, parent.name)} />
      }
    />
  )
}

export function NatureBadge({ node }: NatureBadgeProps) {
  if (node.incomeNature === 'fixed') {
    return (
      <Badge tone="success" size="sm">
        {messages.nature.fixed}
      </Badge>
    )
  }
  if (node.incomeNature === 'variable') {
    return (
      <Badge tone="info" size="sm">
        {messages.nature.variable}
      </Badge>
    )
  }
  return null
}

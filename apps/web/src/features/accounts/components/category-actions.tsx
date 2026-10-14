import { Link } from '@tanstack/react-router'
import { type ItemAction, ItemActions } from '@web/components/actions/item-actions'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { showToast } from '@web/components/feedback/toast'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  AccountAction,
  CategoryActionsProps,
  CategoryNode,
  CategoryRefusal,
} from '@web/features/accounts/accounts.types'
import { useAccountAction } from '@web/features/accounts/api/use-account-action'
import { namesList, parentOf } from '@web/features/accounts/components/category-tree'
import { MoveCategorySheet } from '@web/features/accounts/components/move-category-sheet'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = accountsMessages.categories
const toasts = messages.toasts
const CANNOT_BE_DELETED = 'ACCOUNT_CANNOT_BE_DELETED'
const FEW_CHILDREN = 3

export function CategoryActions({
  workspaceId,
  permissions,
  node,
  tree,
  trigger,
  description,
}: CategoryActionsProps) {
  const { mutateAsync } = useAccountAction(workspaceId)
  const [refusal, setRefusal] = useState<CategoryRefusal | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const canUpdate = hasPermission(permissions, 'accounts', 'update')
  const canDelete = hasPermission(permissions, 'accounts', 'delete')
  const parent = parentOf(node, tree)

  const runEach = async (action: AccountAction, ids: readonly string[]) => {
    for (const id of ids) {
      await mutateAsync({ action, accountId: id })
    }
  }

  async function attempt(work: () => Promise<void>) {
    try {
      await work()
    } catch (error) {
      if (error instanceof ApiError && error.code === CANNOT_BE_DELETED) {
        setRefusal(refusalOf(node))
        return
      }
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  const archive = () =>
    attempt(async () => {
      await runEach('archive', [node.id])
      const childCount = node.children.length
      showToast(
        childCount
          ? toasts.archivedWithChildren(node.name, childCount)
          : toasts.archived(node.name),
        {
          tone: 'success',
          action: {
            label: accountsMessages.toasts.undo,
            onPress: () => void runEach('unarchive', [node.id]),
          },
        },
      )
    })

  const unarchive = () => {
    if (parent?.isArchived) {
      showToast(toasts.parentArchived(parent.name), {
        action: {
          label: toasts.unarchiveParent(parent.name),
          onPress: () =>
            void attempt(async () => {
              await runEach('unarchive', [parent.id, node.id])
              showToast(toasts.unarchived(node.name), { tone: 'success' })
            }),
        },
      })
      return
    }
    return attempt(async () => {
      await runEach('unarchive', [node.id])
      showToast(toasts.unarchived(node.name), { tone: 'success' })
    })
  }

  const remove = () =>
    attempt(async () => {
      await runEach('delete', [node.id])
      showToast(toasts.deleted(node.name), {
        tone: 'success',
        action: {
          label: accountsMessages.toasts.undo,
          onPress: () => void runEach('restore', [node.id]),
        },
      })
    })

  const actions = actionsOf(node, {
    canCreate: hasPermission(permissions, 'accounts', 'create'),
    newSubcategory: (
      <Link to="." search={(previous) => ({ ...previous, category: 'new', parent: node.id })} />
    ),
    edit: <Link to="." search={(previous) => ({ ...previous, category: node.id })} />,
    canUpdate,
    canDelete,
    archive,
    unarchive,
    remove,
    move: () => setIsMoving(true),
  })
  if (actions.length === 0) {
    return null
  }
  return (
    <>
      <ItemActions
        title={node.name}
        description={description}
        triggerLabel={accountsMessages.actions.trigger(node.name)}
        actions={actions}
        trigger={trigger}
        align={trigger ? 'start' : 'end'}
      />
      {refusal && (
        <ConfirmDialog
          title={refusal.title}
          description={refusal.text}
          cancelLabel={messages.refused.cancel}
          confirmLabel={refusal.confirmLabel}
          confirmVariant="primary"
          confirmIcon="archive"
          isOpen
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setRefusal(null)
            }
          }}
          onConfirm={() => void archive()}
        />
      )}
      {node.parentId && (
        <MoveCategorySheet
          workspaceId={workspaceId}
          node={node}
          tree={tree}
          isOpen={isMoving}
          onOpenChange={setIsMoving}
        />
      )}
    </>
  )
}

function actionsOf(
  node: CategoryNode,
  can: {
    canCreate: boolean
    newSubcategory: NonNullable<ItemAction['render']>
    edit: NonNullable<ItemAction['render']>
    canUpdate: boolean
    canDelete: boolean
    archive: () => void
    unarchive: () => void
    remove: () => void
    move: () => void
  },
): ItemAction[] {
  const update = (action: ItemAction) => (can.canUpdate ? [action] : [])
  const remove: ItemAction[] = can.canDelete
    ? [
        {
          key: 'delete',
          label: accountsMessages.actions.delete,
          icon: 'trash',
          tone: 'danger',
          onSelect: can.remove,
        },
      ]
    : []
  if (node.isArchived) {
    return [
      ...update({
        key: 'unarchive',
        label: accountsMessages.actions.unarchive,
        icon: 'unarchive',
        onSelect: can.unarchive,
      }),
      ...remove,
    ]
  }
  const newSubcategory: ItemAction[] =
    can.canCreate && !node.parentId
      ? [
          {
            key: 'new-subcategory',
            label: accountsMessages.categoryForm.newSubcategory,
            icon: 'subcategory',
            render: can.newSubcategory,
          },
        ]
      : []
  return [
    ...newSubcategory,
    ...update({
      key: 'edit',
      label: accountsMessages.actions.edit,
      icon: 'edit',
      render: can.edit,
    }),
    ...(node.parentId
      ? update({ key: 'move', label: messages.move, icon: 'move', onSelect: can.move })
      : []),
    ...update({
      key: 'archive',
      label: accountsMessages.actions.archive,
      icon: 'archive',
      onSelect: can.archive,
    }),
    ...remove,
  ]
}

function refusalOf(node: CategoryNode): CategoryRefusal {
  const refused = messages.refused
  const names = node.children.map((child) => child.name)
  if (names.length === 0) {
    return {
      title: refused.title(node.name),
      text: refused.hasEntries(node.name),
      confirmLabel: refused.archive,
    }
  }
  const [first = '', second = ''] = names
  const text =
    names.length === 1
      ? refused.oneChild(node.name, first)
      : refused.fewChildren(
          node.name,
          names.length > FEW_CHILDREN
            ? messages.manyChildrenList(names.length, first, second)
            : messages.childrenList(names.length, namesList(names)),
          messages.allOf(names.length),
        )
  return {
    title: refused.title(node.name),
    text,
    confirmLabel: refused.archiveAll(names.length + 1),
  }
}

import { showToast } from '@web/components/feedback/toast'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { MoveCategorySheetProps } from '@web/features/accounts/accounts.types'
import { useMoveCategory } from '@web/features/accounts/api/use-move-category'
import { errorMessageFor } from '@web/lib/errors/error-message'

const messages = accountsMessages.categories
const MAIN = ''

export function MoveCategorySheet({
  workspaceId,
  node,
  tree,
  isOpen,
  onOpenChange,
}: MoveCategorySheetProps) {
  const { mutateAsync } = useMoveCategory(workspaceId)
  const sheet = messages.moveSheet
  const items = [
    {
      value: MAIN,
      label: sheet.none,
      detail: sheet.noneDetail(node.name),
      placeholderIcon: 'subcategory' as const,
    },
    ...tree.active
      .filter((main) => main.id !== node.id)
      .map((main) => ({
        value: main.id,
        label: main.name,
        icon: main.icon,
        detail: main.id === node.parentId ? sheet.current : undefined,
      })),
  ]

  async function move(parentId: string | null, previousId: string | null) {
    try {
      await mutateAsync({ accountId: node.id, parentId })
      const parent = tree.active.find((main) => main.id === parentId)
      showToast(
        parent
          ? messages.toasts.moved(node.name, parent.name)
          : messages.toasts.madeMain(node.name),
        {
          tone: 'success',
          action: {
            label: accountsMessages.toasts.undo,
            onPress: () => void mutateAsync({ accountId: node.id, parentId: previousId }),
          },
        },
      )
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  return (
    <PickerSheet
      title={sheet.title(node.name)}
      subtitle={sheet.subtitle(sheet.kindNames[node.kind], node.name)}
      items={items}
      value={node.parentId ?? MAIN}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSelect={(value) => {
        const parentId = value || null
        if (parentId !== node.parentId) {
          void move(parentId, node.parentId)
        }
      }}
    />
  )
}

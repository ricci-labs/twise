import type { Permission } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import type { ItemAction } from '@web/components/actions/item-actions'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import { hasPermission } from '@web/lib/permissions'

const messages = accountsMessages.cardsPage

export function cardEditActionsOf(
  permissions: readonly Permission[],
  cardId: string,
): ItemAction[] {
  const canEdit =
    hasPermission(permissions, 'cards', 'update') ||
    hasPermission(permissions, 'accounts', 'update')
  if (!canEdit) {
    return []
  }
  return [
    {
      key: 'edit',
      label: messages.edit,
      icon: 'edit',
      render: <Link to="." search={(previous) => ({ ...previous, card: cardId })} />,
    },
  ]
}

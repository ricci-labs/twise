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
  return [
    ...(hasPermission(permissions, 'cards', 'update')
      ? [
          {
            key: 'edit-cycle',
            label: messages.editCycle,
            icon: 'calendar',
            render: (
              <Link to="." search={(previous) => ({ ...previous, card: cardId, part: 'cycle' })} />
            ),
          } as const,
        ]
      : []),
    ...(hasPermission(permissions, 'accounts', 'update')
      ? [
          {
            key: 'rename',
            label: messages.rename,
            icon: 'edit',
            render: (
              <Link to="." search={(previous) => ({ ...previous, card: cardId, part: 'name' })} />
            ),
          } as const,
        ]
      : []),
  ]
}

import { type ItemAction, ItemActions } from '@web/components/actions/item-actions'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { StepActionsProps } from '@web/features/planning/planning.types'

const messages = planningMessages.split.actions

export function StepActions({
  position,
  title,
  canMoveUp,
  canMoveDown,
  isRest,
  onMove,
  onEdit,
  onRemove,
}: StepActionsProps) {
  const actions: ItemAction[] = [
    ...(canMoveUp
      ? [{ key: 'up', label: messages.up, icon: 'collapse', onSelect: () => onMove(-1) } as const]
      : []),
    ...(canMoveDown
      ? [{ key: 'down', label: messages.down, icon: 'expand', onSelect: () => onMove(1) } as const]
      : []),
    ...(onEdit
      ? [{ key: 'edit', label: messages.edit, icon: 'edit', onSelect: onEdit } as const]
      : []),
    ...(isRest
      ? []
      : [
          {
            key: 'remove',
            label: messages.remove,
            icon: 'trash',
            tone: 'danger',
            onSelect: onRemove,
          } as const,
        ]),
  ]
  return <ItemActions title={title} triggerLabel={messages.trigger(position)} actions={actions} />
}

import { Link } from '@tanstack/react-router'
import { type ItemAction, ItemActions } from '@web/components/actions/item-actions'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { showToast } from '@web/components/feedback/toast'
import { useDeleteGoal } from '@web/features/planning/api/use-delete-goal'
import { stepsWithoutGoal } from '@web/features/planning/components/allocation-steps'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { GoalActionsProps } from '@web/features/planning/planning.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = planningMessages.goals

export function GoalActions({
  workspaceId,
  goal,
  accountName,
  steps,
  permissions,
}: GoalActionsProps) {
  const remove = useDeleteGoal(workspaceId)
  const [isConfirming, setIsConfirming] = useState(false)
  const remainingSteps = stepsWithoutGoal(steps, goal.id)
  const name = goal.isReserve ? messages.reserveName : goal.name

  async function confirmRemove() {
    try {
      await remove.mutateAsync({ goalId: goal.id, remainingSteps })
      setIsConfirming(false)
      showToast(messages.removed, { tone: 'success' })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  const actions: ItemAction[] = [
    ...(hasPermission(permissions, 'entries', 'create')
      ? [
          {
            key: 'save',
            label: messages.actions.save,
            icon: 'wallet',
            render: (
              <Link
                to="."
                search={(previous) => ({
                  ...previous,
                  entry: 'new',
                  entryType: 'transfer',
                  entryToAccount: goal.accountId,
                  entryAmount: goal.monthlyToTargetCents || undefined,
                })}
              />
            ),
          } as const,
        ]
      : []),
    {
      key: 'entries',
      label: messages.actions.entries,
      icon: 'list',
      render: (
        <Link
          to="/w/$workspaceId/entries"
          params={{ workspaceId }}
          search={{ accountId: goal.accountId }}
        />
      ),
    },
    ...(hasPermission(permissions, 'planning', 'delete')
      ? [
          {
            key: 'remove',
            label: messages.actions.remove,
            icon: 'trash',
            tone: 'danger',
            onSelect: () => setIsConfirming(true),
          } as const,
        ]
      : []),
  ]
  return (
    <>
      <ItemActions title={name} triggerLabel={messages.actions.trigger(name)} actions={actions} />
      <ConfirmDialog
        title={messages.removeTitle(name)}
        description={
          remainingSteps ? messages.removeInSplit(accountName) : messages.removeText(accountName)
        }
        cancelLabel={messages.cancel}
        confirmLabel={remainingSteps ? messages.removeAndSplit : messages.actions.remove}
        confirmVariant="danger"
        isOpen={isConfirming}
        onOpenChange={setIsConfirming}
        onConfirm={() => void confirmRemove()}
      />
    </>
  )
}

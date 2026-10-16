import { useQuery } from '@tanstack/react-query'
import {
  accountsQueryOptions,
  goalsQueryOptions,
  periodsQueryOptions,
} from '@web/features/planning/api/planning.queries'
import { GoalForm } from '@web/features/planning/components/goal-form'
import { blankGoal, goalInputOf } from '@web/features/planning/components/goal-input'
import { NEW_GOAL } from '@web/features/planning/planning.schemas'
import type { GoalEditorProps } from '@web/features/planning/planning.types'
import { hasPermission } from '@web/lib/permissions'

export function GoalEditor({ workspaceId, permissions, search, onClose }: GoalEditorProps) {
  const accounts = useQuery(accountsQueryOptions(workspaceId)).data
  const goals = useQuery(goalsQueryOptions(workspaceId)).data
  const today = useQuery(periodsQueryOptions(workspaceId, undefined)).data?.today
  if (search.goal === undefined || !accounts || !goals || !today) {
    return null
  }
  const isNew = search.goal === NEW_GOAL
  if (!hasPermission(permissions, 'planning', isNew ? 'create' : 'update')) {
    return null
  }
  const goal = goals.find((candidate) => candidate.id === search.goal)
  if (!isNew && !goal) {
    return null
  }
  return (
    <GoalForm
      workspaceId={workspaceId}
      today={today}
      accounts={accounts}
      goals={goals}
      defaults={goal ? goalInputOf(goal) : blankGoal(search.goalReserve === true)}
      editingGoalId={goal?.id}
      onClose={onClose}
    />
  )
}

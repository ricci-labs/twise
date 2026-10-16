import { useQuery } from '@tanstack/react-query'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { GoalCard } from '@web/components/finance/goal-card'
import { OccurrenceGroup } from '@web/components/finance/occurrence-group'
import { ReserveCard } from '@web/components/finance/reserve-card'
import {
  accountsQueryOptions,
  allocationStepsQueryOptions,
  goalsQueryOptions,
  overviewQueryOptions,
} from '@web/features/planning/api/planning.queries'
import { GoalActions } from '@web/features/planning/components/goal-actions'
import {
  accountNameOf,
  goalCardOf,
  reserveFiguresOf,
} from '@web/features/planning/components/goal-views'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { GoalsTabProps, GoalsViewProps } from '@web/features/planning/planning.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'

const messages = planningMessages.goals
const SKELETON_ROWS = 4

export function GoalsTab({ workspaceId, permissions }: GoalsTabProps) {
  usePageTitle(messages.pageTitle)
  const goals = useQuery(goalsQueryOptions(workspaceId))
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const steps = useQuery(allocationStepsQueryOptions(workspaceId))
  const overview = useQuery(overviewQueryOptions(workspaceId, undefined))
  const failed = [goals, accounts, steps].find((query) => query.isError)
  if (failed) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={failed.error instanceof ApiError ? failed.error.ref : null}
        isRetrying={failed.isFetching}
        onRetry={() => void failed.refetch()}
      />
    )
  }
  if (!goals.data || !accounts.data || !steps.data) {
    return <ListSkeleton rows={SKELETON_ROWS} />
  }
  return (
    <Goals
      workspaceId={workspaceId}
      goals={goals.data}
      accounts={new Map(accounts.data.map((account) => [account.id, account]))}
      steps={steps.data}
      coverageMonths={overview.data?.metrics.reserveCoverage?.months ?? null}
      permissions={permissions}
    />
  )
}

function Goals({
  workspaceId,
  goals,
  accounts,
  steps,
  coverageMonths,
  permissions,
}: GoalsViewProps) {
  const reserve = goals.find((goal) => goal.isReserve)
  const others = goals.filter((goal) => !goal.isReserve)
  const actionsOf = (goal: GoalsViewProps['goals'][number]) => (
    <GoalActions
      workspaceId={workspaceId}
      goal={goal}
      accountName={accountNameOf(goal, accounts)}
      steps={steps}
      permissions={permissions}
    />
  )
  return (
    <>
      <ReserveCard
        reserve={reserve ? reserveFiguresOf(reserve, accounts, coverageMonths) : null}
        actions={reserve && actionsOf(reserve)}
      />
      {others.length === 0 ? (
        <EmptyBlock icon="piggy-bank" title={messages.empty} text={messages.emptyText} />
      ) : (
        <OccurrenceGroup title={messages.title} count={others.length} layout="cards">
          {others.map((goal) => (
            <GoalCard key={goal.id} {...goalCardOf(goal, accounts)} actions={actionsOf(goal)} />
          ))}
        </OccurrenceGroup>
      )}
    </>
  )
}

import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { GoalCard } from '@web/components/finance/goal-card'
import { OccurrenceGroup } from '@web/components/finance/occurrence-group'
import { ReserveCard } from '@web/components/finance/reserve-card'
import { SplitShortcut } from '@web/components/finance/split-shortcut'
import { TwiseIcon } from '@web/components/icons/twise-icon'
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
import { shortcutTextOf } from '@web/features/planning/components/split-views'
import { planningMessages } from '@web/features/planning/planning.messages'
import { NEW_GOAL } from '@web/features/planning/planning.schemas'
import type { GoalsTabProps, GoalsViewProps } from '@web/features/planning/planning.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'

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
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const canCreate = hasPermission(permissions, 'planning', 'create')
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
        createAction={
          canCreate && (
            <Button size="sm" render={newGoalLink(true)}>
              <TwiseIcon name="plus" size="sm" />
              {messages.createReserve}
            </Button>
          )
        }
      />
      {others.length === 0 ? (
        <EmptyBlock
          icon="piggy-bank"
          title={messages.empty}
          text={messages.emptyText}
          action={
            canCreate && (
              <Button render={newGoalLink(false)}>
                <TwiseIcon name="plus" size="sm" />
                {messages.newGoal}
              </Button>
            )
          }
        />
      ) : (
        <OccurrenceGroup
          title={messages.title}
          count={others.length}
          layout="cards"
          add={
            canCreate && !isDesktop
              ? { label: messages.newGoal, link: newGoalLink(false) }
              : undefined
          }
        >
          {others.map((goal) => (
            <GoalCard key={goal.id} {...goalCardOf(goal, accounts)} actions={actionsOf(goal)} />
          ))}
        </OccurrenceGroup>
      )}
      <SplitShortcut
        text={shortcutTextOf(steps, {
          goals: new Map(goals.map((goal) => [goal.id, goal])),
          accounts,
          overspentCents: 0,
        })}
        canEdit={hasPermission(permissions, 'planning', 'update')}
        link={<Link to="/w/$workspaceId/planning/split" params={{ workspaceId }} />}
      />
    </>
  )
}

function newGoalLink(isReserve: boolean) {
  return (
    <Link
      to="."
      search={(previous) => ({
        ...previous,
        goal: NEW_GOAL,
        goalReserve: isReserve || undefined,
      })}
    />
  )
}

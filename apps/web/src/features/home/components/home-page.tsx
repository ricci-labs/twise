import { useQuery } from '@tanstack/react-query'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { Tip } from '@web/components/feedback/tip'
import {
  accountIconsQueryOptions,
  accountNamesQueryOptions,
  contactNamesQueryOptions,
  overviewQueryOptions,
  setupQueryOptions,
} from '@web/features/home/api/home.queries'
import { AchievementsCard } from '@web/features/home/components/achievements-card'
import { BillsDueCard } from '@web/features/home/components/bills-due-card'
import { BudgetsCard } from '@web/features/home/components/budgets-card'
import { CanIBuyCard } from '@web/features/home/components/can-i-buy-card'
import { ComingMonthsCard } from '@web/features/home/components/coming-months-card'
import { CommissionsCard } from '@web/features/home/components/commissions-card'
import { FirstRun } from '@web/features/home/components/first-run'
import { ForecastCard } from '@web/features/home/components/forecast-card'
import { HomeHeader } from '@web/features/home/components/home-header'
import { HomeIndicators } from '@web/features/home/components/home-indicators'
import { IncomeSplitCard } from '@web/features/home/components/income-split-card'
import { InsightsCard } from '@web/features/home/components/insights-card'
import { InvoicesCard } from '@web/features/home/components/invoices-card'
import { PaceCard } from '@web/features/home/components/pace-card'
import { periodStageOf } from '@web/features/home/components/period-stage'
import { ReceivablesCard } from '@web/features/home/components/receivables-card'
import { ReserveGoalsCard } from '@web/features/home/components/reserve-goals-card'
import { homeMessages } from '@web/features/home/home.messages'
import type {
  HomeContentProps,
  HomeFailedProps,
  HomePageProps,
  IconLookup,
  NameLookup,
  Overview,
  SetupState,
  SetupStep,
} from '@web/features/home/home.types'
import { useFirstTimeThisSession } from '@web/hooks/use-first-time-this-session'
import { useJustCreated } from '@web/hooks/use-just-created'
import { useMarkInView } from '@web/hooks/use-mark-in-view'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { useSwapPhase } from '@web/hooks/use-swap-phase'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { cn } from '@web/lib/cn'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { hasPermission, isReadOnly } from '@web/lib/permissions'
import { useRef } from 'react'

const HOME_PAGE = 'mx-auto w-full max-w-400 px-4 py-6 lg:px-8 lg:pt-7 lg:pb-12'

const SAO_PAULO_HOUR = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  hour: 'numeric',
  hourCycle: 'h23',
})

export function HomePage({
  workspaceId,
  period,
  displayName,
  permissions,
  workspaceName,
  memberCount,
}: HomePageProps) {
  usePageTitle(homeMessages.pageTitle)
  const isFirstVisit = useFirstTimeThisSession('home')
  const isJustCreated = useJustCreated(workspaceId)
  const overview = useQuery(overviewQueryOptions(workspaceId, period))
  const accountNames = useQuery(accountNamesQueryOptions(workspaceId)).data
  const setup = useQuery(setupQueryOptions(workspaceId)).data
  const contactNames = useQuery({
    ...contactNamesQueryOptions(workspaceId),
    enabled: hasPermission(permissions, 'contacts', 'view'),
  }).data
  const nameOf: NameLookup = (id) =>
    (id && (accountNames?.get(id) ?? contactNames?.get(id))) || homeMessages.unnamed
  const accountIcons = useQuery(accountIconsQueryOptions(workspaceId)).data
  const iconOf: IconLookup = (id) => accountIcons?.get(id) ?? null

  if (!overview.data) {
    return overview.isError ? (
      <HomeFailed
        error={overview.error}
        isRetrying={overview.isFetching}
        onRetry={() => void overview.refetch()}
      />
    ) : (
      <HomeLoading />
    )
  }

  const data = overview.data
  if (setup && !setup.hasMoneyAccount) {
    return (
      <div className={HOME_PAGE}>
        <FirstRun
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          canInvite={memberCount <= 1 && hasPermission(permissions, 'members', 'create')}
          isJustCreated={isJustCreated}
          steps={setupSteps(setup, data)}
        />
      </div>
    )
  }
  return (
    <HomeContent
      workspaceId={workspaceId}
      data={data}
      displayName={displayName}
      permissions={permissions}
      nameOf={nameOf}
      iconOf={iconOf}
      isFirstVisit={isFirstVisit}
      isStale={overview.isPlaceholderData}
      updatedAt={overview.dataUpdatedAt}
    />
  )
}

function HomeFailed({ error, isRetrying, onRetry }: HomeFailedProps) {
  return (
    <div className={HOME_PAGE}>
      <SectionError
        message={errorMessageFor(error)}
        errorRef={error instanceof ApiError ? error.ref : null}
        isRetrying={isRetrying}
        onRetry={onRetry}
      />
    </div>
  )
}

function HomeLoading() {
  return (
    <div className={cn(HOME_PAGE, 'grid gap-5 lg:grid-cols-4')}>
      {['free', 'income', 'spent', 'committed'].map((key) => (
        <SectionSkeleton key={key} lines={2} />
      ))}
      <SectionSkeleton hasChart className="lg:col-span-3" />
      <SectionSkeleton />
    </div>
  )
}

function setupSteps(setup: SetupState, overview: Overview): SetupStep[] {
  return [
    { key: 'accounts', area: 'accounts', isDone: setup.hasMoneyAccount },
    { key: 'cards', area: 'cards', isDone: setup.hasCard },
    { key: 'income', area: 'planning', isDone: overview.metrics.fixedIncome > 0 },
    { key: 'entries', area: 'new-entry', isDone: overview.metrics.spent > 0 },
  ]
}

function HomeContent({
  workspaceId,
  data,
  displayName,
  permissions,
  nameOf,
  iconOf,
  isFirstVisit,
  isStale,
  updatedAt,
}: HomeContentProps) {
  const canWrite = hasPermission(permissions, 'entries', 'create')
  const stage = periodStageOf(data)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const swap = useSwapPhase(data.period.label)
  const isEntrance = isFirstVisit && swap === undefined
  const gridRef = useRef<HTMLDivElement>(null)
  useMarkInView(gridRef, isEntrance)
  return (
    <div
      data-entrance={isEntrance ? 'play' : undefined}
      data-swap={swap}
      data-stale={isStale ? '' : undefined}
      aria-busy={isStale || undefined}
      className={cn(HOME_PAGE, 'flex flex-col gap-5')}
    >
      <HomeHeader
        workspaceId={workspaceId}
        overview={data}
        stage={stage}
        displayName={displayName}
        hour={Number(SAO_PAULO_HOUR.format(new Date()))}
        updatedAt={updatedAt}
      />
      {isReadOnly(permissions) && isDesktop && (
        <Tip tone="readOnly" className="self-start">
          {homeMessages.readOnly}
        </Tip>
      )}
      <div className="-mx-4 lg:mx-0">
        <HomeIndicators workspaceId={workspaceId} overview={data} stage={stage} />
      </div>
      {stage !== 'closed' && <CanIBuyCard workspaceId={workspaceId} className="lg:hidden" />}
      <div
        ref={gridRef}
        data-slot="home-grid"
        className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12"
      >
        <InsightsCard
          workspaceId={workspaceId}
          overview={data}
          nameOf={nameOf}
          canWrite={canWrite}
          className="lg:order-2 lg:col-span-4"
        />
        <BillsDueCard
          workspaceId={workspaceId}
          overview={data}
          canWrite={canWrite}
          className="lg:order-7 lg:col-span-4"
        />
        {stage === 'closed' && (
          <AchievementsCard
            workspaceId={workspaceId}
            overview={data}
            className="lg:order-1 lg:col-span-8"
          />
        )}
        {stage === 'open' && (
          <ForecastCard
            workspaceId={workspaceId}
            overview={data}
            nameOf={nameOf}
            className="lg:order-1 lg:col-span-8"
          />
        )}
        <PaceCard
          workspaceId={workspaceId}
          overview={data}
          stage={stage}
          className="lg:order-4 lg:col-span-4"
        />
        <BudgetsCard
          workspaceId={workspaceId}
          overview={data}
          nameOf={nameOf}
          iconOf={iconOf}
          canPlan={hasPermission(permissions, 'budgets', 'update')}
          className="lg:order-3 lg:col-span-8"
        />
        <ComingMonthsCard
          workspaceId={workspaceId}
          overview={data}
          className="lg:order-5 lg:col-span-8"
        />
        <IncomeSplitCard
          workspaceId={workspaceId}
          overview={data}
          className="lg:order-6 lg:col-span-4"
        />
        <InvoicesCard
          workspaceId={workspaceId}
          overview={data}
          nameOf={nameOf}
          className="lg:order-8 lg:col-span-4"
        />
        <ReserveGoalsCard
          workspaceId={workspaceId}
          overview={data}
          canPlan={hasPermission(permissions, 'planning', 'create')}
          className="lg:order-9 lg:col-span-4"
        />
        <CommissionsCard
          workspaceId={workspaceId}
          overview={data}
          canWrite={canWrite}
          className="lg:order-10 lg:col-span-6"
        />
        <ReceivablesCard
          workspaceId={workspaceId}
          overview={data}
          nameOf={nameOf}
          canCharge={hasPermission(permissions, 'contacts', 'create')}
          className="lg:order-11 lg:col-span-6"
        />
      </div>
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import {
  accountNamesQueryOptions,
  contactNamesQueryOptions,
  overviewQueryOptions,
} from '@web/features/home/api/home.queries'
import { BillsDueCard } from '@web/features/home/components/bills-due-card'
import { BudgetsCard } from '@web/features/home/components/budgets-card'
import { CanIBuyCard } from '@web/features/home/components/can-i-buy-card'
import { ComingMonthsCard } from '@web/features/home/components/coming-months-card'
import { CommissionsCard } from '@web/features/home/components/commissions-card'
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
import type { HomePageProps, NameLookup } from '@web/features/home/home.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { hasPermission } from '@web/lib/permissions'

const SAO_PAULO_HOUR = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  hour: 'numeric',
  hourCycle: 'h23',
})

export function HomePage({ workspaceId, period, displayName, permissions }: HomePageProps) {
  usePageTitle(homeMessages.pageTitle)
  const overview = useQuery(overviewQueryOptions(workspaceId, period))
  const accountNames = useQuery(accountNamesQueryOptions(workspaceId)).data
  const contactNames = useQuery({
    ...contactNamesQueryOptions(workspaceId),
    enabled: hasPermission(permissions, 'contacts', 'view'),
  }).data
  const nameOf: NameLookup = (id) =>
    (id && (accountNames?.get(id) ?? contactNames?.get(id))) || homeMessages.unnamed
  const canWrite = hasPermission(permissions, 'entries', 'create')

  if (overview.isError && !overview.data) {
    return (
      <div className="mx-auto w-full max-w-274 px-4 py-6 lg:px-8">
        <SectionError
          message={errorMessageFor(overview.error)}
          errorRef={overview.error instanceof ApiError ? overview.error.ref : null}
          isRetrying={overview.isFetching}
          onRetry={() => void overview.refetch()}
        />
      </div>
    )
  }
  if (!overview.data) {
    return (
      <div className="mx-auto grid w-full max-w-274 gap-5 px-4 py-6 lg:grid-cols-4 lg:px-8">
        {['free', 'income', 'spent', 'committed'].map((key) => (
          <SectionSkeleton key={key} lines={2} />
        ))}
        <SectionSkeleton hasChart className="lg:col-span-3" />
        <SectionSkeleton />
      </div>
    )
  }

  const data = overview.data
  const stage = periodStageOf(data)
  return (
    <div className="mx-auto flex w-full max-w-274 flex-col gap-5 px-4 py-6 lg:px-8">
      <HomeHeader
        workspaceId={workspaceId}
        overview={data}
        stage={stage}
        displayName={displayName}
        hour={Number(SAO_PAULO_HOUR.format(new Date()))}
      />
      <div className="-mx-4 lg:mx-0">
        <HomeIndicators workspaceId={workspaceId} overview={data} stage={stage} />
      </div>
      {stage !== 'closed' && <CanIBuyCard workspaceId={workspaceId} />}
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
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

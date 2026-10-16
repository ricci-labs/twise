import { addMonths, formatBrl, parseIsoDate, toYearMonthLabel } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@web/components/actions/button'
import { CategoryArt } from '@web/components/display/category-art'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { BudgetRow } from '@web/components/finance/budget-row'
import { BudgetSummary } from '@web/components/finance/budget-summary'
import { OccurrenceGroup } from '@web/components/finance/occurrence-group'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import {
  accountsQueryOptions,
  overviewQueryOptions,
  periodsQueryOptions,
} from '@web/features/planning/api/planning.queries'
import { BudgetSheet } from '@web/features/planning/components/budget-sheet'
import {
  budgetLinesOf,
  budgetSheetOf,
  unbudgetedOf,
} from '@web/features/planning/components/budget-views'
import { BudgetsDesktop } from '@web/features/planning/components/budgets-desktop'
import { PlanningPeriod } from '@web/features/planning/components/planning-period'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  BudgetsProps,
  BudgetsTabProps,
  BudgetsViewProps,
  UnbudgetedRowProps,
} from '@web/features/planning/planning.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { formatMonthLabel } from '@web/lib/format/calendar'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = planningMessages.budgets
const SKELETON_ROWS = 5
const PERIOD_CHOICES = 6

export function BudgetsTab({ workspaceId, permissions, search }: BudgetsTabProps) {
  usePageTitle(messages.pageTitle)
  const overview = useQuery(overviewQueryOptions(workspaceId, search.period))
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const periods = useQuery(periodsQueryOptions(workspaceId, undefined))
  const failed = [overview, accounts, periods].find((query) => query.isError)
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
  if (!overview.data || !accounts.data || !periods.data) {
    return <ListSkeleton rows={SKELETON_ROWS} />
  }
  return (
    <>
      <PlanningPeriod
        workspaceId={workspaceId}
        label={overview.data.period.label}
        start={overview.data.period.start}
        end={overview.data.period.end}
        currentLabel={periods.data.currentLabel}
      />
      <Budgets
        workspaceId={workspaceId}
        overview={overview.data}
        accounts={new Map(accounts.data.map((account) => [account.id, account]))}
        canChange={hasPermission(permissions, 'budgets', 'update')}
      />
    </>
  )
}

function Budgets({ workspaceId, overview, accounts, canChange }: BudgetsProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [openFor, setOpenFor] = useState<string | null>(null)
  const view = {
    overview,
    lines: budgetLinesOf(overview, accounts),
    unbudgeted: unbudgetedOf(overview, accounts),
    onOpen: canChange ? setOpenFor : undefined,
  }
  const label = overview.period.label
  return (
    <>
      {isDesktop ? <BudgetsDesktop {...view} /> : <BudgetsPhone {...view} />}
      {openFor && (
        <BudgetSheet
          workspaceId={workspaceId}
          view={budgetSheetOf(openFor, overview, accounts)}
          periodLabel={label}
          periodOptions={periodOptionsFrom(label)}
          isOpen
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpenFor(null)
            }
          }}
        />
      )}
    </>
  )
}

function BudgetsPhone({ overview, lines, unbudgeted, onOpen }: BudgetsViewProps) {
  const { budgetTotals, periodProgress } = overview.metrics
  return (
    <>
      {lines.length === 0 ? (
        <EmptyBlock icon="calendar" title={messages.empty} text={messages.emptyText} />
      ) : (
        <>
          <BudgetSummary
            title={messages.summary}
            spentCents={budgetTotals.spentCents}
            limitCents={budgetTotals.limitCents}
            markPercent={periodProgress.elapsedPercent}
            legend={messages.legend(periodProgress.elapsed, periodProgress.total)}
          />
          <OccurrenceGroup title={messages.withBudget} count={lines.length}>
            {lines.map((line) => (
              <BudgetRow
                key={line.categoryAccountId}
                {...line}
                markPercent={periodProgress.elapsedPercent}
                moreHint={messages.moreHint(line.name)}
                onMore={() => onOpen?.(line.categoryAccountId)}
                actions={
                  onOpen ? (
                    <button
                      type="button"
                      aria-label={messages.actions(line.name)}
                      onClick={() => onOpen(line.categoryAccountId)}
                      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-ink-muted outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring"
                    >
                      <TwiseIcon name="more" />
                    </button>
                  ) : undefined
                }
              />
            ))}
          </OccurrenceGroup>
        </>
      )}
      {unbudgeted.length > 0 && (
        <OccurrenceGroup title={messages.withoutBudget} count={unbudgeted.length}>
          {unbudgeted.map((category) => (
            <UnbudgetedRow
              key={category.categoryAccountId}
              category={category}
              onDefine={onOpen ? () => onOpen(category.categoryAccountId) : undefined}
            />
          ))}
        </OccurrenceGroup>
      )}
    </>
  )
}

function UnbudgetedRow({ category, onDefine }: UnbudgetedRowProps) {
  return (
    <li className="flex items-center gap-3 border-border py-2.5 not-first:border-t">
      <CategoryArt name={category.art.name} icon={category.art.icon} size="md" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 text-row font-semibold break-words">{category.name}</span>
        <span className="text-row-detail text-ink-muted">
          {messages.spentInPeriod(formatBrl(category.spentCents))}
        </span>
      </span>
      {onDefine && (
        <Button
          variant="outline"
          size="xs"
          aria-label={messages.defineFor(category.name)}
          onClick={onDefine}
        >
          {messages.define}
        </Button>
      )}
    </li>
  )
}

function periodOptionsFrom(label: string) {
  const start = parseIsoDate(`${label}-01`)
  return Array.from({ length: PERIOD_CHOICES }, (_, step) => {
    const value = toYearMonthLabel(addMonths(start, step))
    return { value, label: formatMonthLabel(value) }
  })
}

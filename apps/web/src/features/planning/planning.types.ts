import type { IsoDate, Permission } from '@financas/shared'
import type { OccurrenceBadge, OccurrenceDirection } from '@web/components/finance/occurrence-row'
import type { PlanSummaryTile } from '@web/components/finance/plan-summary-tiles'
import type { fetchAccounts, fetchOccurrences } from '@web/features/planning/api/planning.queries'
import type { PLANNING_TABS, planningSearchSchema } from '@web/features/planning/planning.schemas'
import type { z } from 'zod'

export type PlanningTab = (typeof PLANNING_TABS)[number]

export type PlanningSearch = z.infer<typeof planningSearchSchema>

export type MemberDirectory = readonly { userId: string; displayName: string }[]

export type PlanningPageProps = {
  workspaceId: string
  tab: PlanningTab
  search: PlanningSearch
  permissions: readonly Permission[]
  memberDirectory: MemberDirectory
}

export type PlanningAccount = Awaited<ReturnType<typeof fetchAccounts>>[number]

export type OccurrenceList = Awaited<ReturnType<typeof fetchOccurrences>>

export type ListedOccurrence = OccurrenceList['items'][number]

export type OccurrenceGroupKey = keyof OccurrenceList['totals']['groups']

export type OccurrenceContext = {
  today: IsoDate
  accounts: ReadonlyMap<string, Pick<PlanningAccount, 'name' | 'parentId'>>
  memberNames: ReadonlyMap<string, string>
}

export type OccurrenceRowView = {
  id: string
  dueOn: IsoDate
  description: string
  detail: string
  badge?: OccurrenceBadge
  amountCents: number
  direction: OccurrenceDirection
  isEstimate: boolean
  isDone: boolean
  isOverdue: boolean
}

export type OccurrenceGroupView = {
  key: OccurrenceGroupKey
  title: string
  count: number
  rows: OccurrenceRowView[]
}

export type OccurrenceSummaryTiles = readonly [PlanSummaryTile, PlanSummaryTile]

export type PlanningPeriodProps = {
  workspaceId: string
  label: string
  start: IsoDate
  end: IsoDate
  currentLabel: string
}

export type OccurrencesTabProps = Omit<PlanningPageProps, 'tab'>

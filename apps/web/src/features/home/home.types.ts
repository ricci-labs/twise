import type { Permission } from '@financas/shared'
import type { fetchOverview } from '@web/features/home/api/home.queries'
import type { homeSearchSchema } from '@web/features/home/home.schemas'
import type { z } from 'zod'

export type HomeSearch = z.infer<typeof homeSearchSchema>

export type Overview = Awaited<ReturnType<typeof fetchOverview>>

export type OverviewMetrics = Overview['metrics']

export type OverviewInsight = Overview['insights'][number]

export type PeriodStage = 'open' | 'closed' | 'future'

export type HomePageProps = {
  workspaceId: string
  period?: string
  displayName: string
  permissions: readonly Permission[]
}

export type HomeSectionProps = {
  workspaceId: string
  overview: Overview
  className?: string
}

export type NameLookup = (id: string | null) => string

export type InsightText = {
  template: string
  values: Readonly<Record<string, string | number>>
}

export type InsightAction = {
  label: string
  area: string
}

export type HomeHeaderProps = HomeSectionProps & {
  stage: PeriodStage
  displayName: string
  hour: number
}

export type HomeIndicatorsProps = HomeSectionProps & {
  stage: PeriodStage
}

export type OverviewBill = OverviewMetrics['billsDue']['items'][number]

export type InsightsCardProps = HomeSectionProps & {
  nameOf: NameLookup
  canWrite: boolean
}

export type InsightItemProps = {
  workspaceId: string
  insight: OverviewInsight
  nameOf: NameLookup
  canWrite: boolean
}

export type BillsDueCardProps = HomeSectionProps & {
  canWrite: boolean
}

export type BillRowProps = {
  workspaceId: string
  bill: OverviewBill
  canWrite: boolean
}

export type CanIBuyCardProps = {
  workspaceId: string
}

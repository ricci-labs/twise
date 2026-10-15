import type { IsoDate, Permission } from '@financas/shared'
import type {
  OccurrenceBadge,
  OccurrenceDirection,
  OccurrenceRegister,
  OccurrenceRowLinkProps,
} from '@web/components/finance/occurrence-row'
import type { PlanSummaryTile } from '@web/components/finance/plan-summary-tiles'
import type { RecurrenceDirection, RecurrenceNext } from '@web/components/finance/recurrence-row'
import type {
  fetchAccounts,
  fetchCandidates,
  fetchOccurrences,
  fetchRecurrences,
} from '@web/features/planning/api/planning.queries'
import type {
  occurrenceAmountFormSchema,
  PLANNING_TABS,
  planningSearchSchema,
} from '@web/features/planning/planning.schemas'
import type { ReactElement, ReactNode } from 'react'
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

export type OccurrenceActionRequest =
  | { action: 'skip' | 'unskip' | 'unmatch'; occurrenceId: string }
  | { action: 'match'; occurrenceId: string; entryId: string }
  | { action: 'amount'; occurrenceId: string; amountCents: number }

export type PlanningAccounts = ReadonlyMap<string, Pick<PlanningAccount, 'name' | 'icon'>>

export type OccurrenceActionsProps = {
  workspaceId: string
  occurrence: ListedOccurrence
  accounts: PlanningAccounts
  canRecord: boolean
  className?: string
  children?: ReactNode
}

export type OccurrenceAmountSheetProps = {
  workspaceId: string
  occurrence: ListedOccurrence
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export type OccurrenceAmountFormInput = z.input<typeof occurrenceAmountFormSchema>

export type OccurrencesProps = {
  workspaceId: string
  list: OccurrenceList
  context: OccurrenceContext
  accounts: PlanningAccounts
  canUpdate: boolean
  canRecord: boolean
  isFiltered?: boolean
}

export type GroupProps = {
  group: OccurrenceGroupView
  linkOf: (id: string) => ReactElement<OccurrenceRowLinkProps> | undefined
  registerOf: (id: string) => OccurrenceRegister | undefined
}

export type MatchCandidate = Awaited<ReturnType<typeof fetchCandidates>>['items'][number]

export type EntryPickerSheetProps = {
  workspaceId: string
  occurrence: ListedOccurrence
  accounts: PlanningAccounts
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export type CandidateRowProps = {
  item: MatchCandidate
  account: string
  art: Pick<PlanningAccount, 'name' | 'icon'> | undefined
  rowRef: ((element: HTMLElement | null) => void) | undefined
}

export type OccurrenceHandlers = {
  changeAmount: () => void
  pickEntry: () => void
  skip: () => void
  unskip: () => void
  unmatch: () => void
}

export type RecurrenceList = Awaited<ReturnType<typeof fetchRecurrences>>

export type ListedRecurrence = RecurrenceList['items'][number]

export type RecurrenceGroupKey = 'bills' | 'income' | 'transfers'

export type RecurrenceContext = {
  today: IsoDate
  accounts: ReadonlyMap<string, Pick<PlanningAccount, 'name' | 'parentId' | 'icon'>>
}

export type RecurrenceRowView = {
  id: string
  description: string
  detail: string
  next?: RecurrenceNext
  art: { name: string; icon: string | null }
  amountCents: number
  direction: RecurrenceDirection
  isEstimate: boolean
}

export type RecurrenceGroupView = {
  key: RecurrenceGroupKey
  title: string
  rows: RecurrenceRowView[]
}

export type RecurrencesTabProps = Omit<PlanningPageProps, 'tab' | 'search'>

export type RecurrenceActionsProps = {
  workspaceId: string
  recurrence: ListedRecurrence
  canDelete: boolean
  className?: string
  children?: ReactNode
}

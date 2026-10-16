import type { AllocationStepInput, IsoDate, Permission, RecurringEntryType } from '@financas/shared'
import type { BudgetChild, BudgetStatus } from '@web/components/finance/budget-row'
import type {
  OccurrenceBadge,
  OccurrenceDirection,
  OccurrenceRegister,
  OccurrenceRowLinkProps,
} from '@web/components/finance/occurrence-row'
import type { PlanSummaryTile } from '@web/components/finance/plan-summary-tiles'
import type { RecurrenceDirection, RecurrenceNext } from '@web/components/finance/recurrence-row'
import type { FieldControlProps } from '@web/components/forms/form-field'
import type { PickerEmpty, PickerItem, PickerSheetProps } from '@web/components/inputs/picker-sheet'
import type {
  fetchAccounts,
  fetchAllocationSteps,
  fetchBalances,
  fetchCandidates,
  fetchGoals,
  fetchOccurrences,
  fetchOverview,
  fetchRecurrences,
} from '@web/features/planning/api/planning.queries'
import type {
  budgetFormSchema,
  DAY_RULES,
  goalFormSchema,
  occurrenceAmountFormSchema,
  PLANNING_TABS,
  planningSearchSchema,
  recurrenceFormSchema,
} from '@web/features/planning/planning.schemas'
import type { ReactElement, ReactNode, RefObject } from 'react'
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

export type PlanningHeaderActionProps = {
  tab: PlanningTab
  permissions: readonly Permission[]
}

export type PlanningAccount = Awaited<ReturnType<typeof fetchAccounts>>[number]

export type PlanningGoal = Awaited<ReturnType<typeof fetchGoals>>[number]

export type AllocationStepItem = Awaited<ReturnType<typeof fetchAllocationSteps>>[number]

export type GoalDeletion = {
  goalId: string
  remainingSteps?: readonly AllocationStepInput[]
}

export type GoalFormValues = z.infer<typeof goalFormSchema>

export type GoalEditorProps = {
  workspaceId: string
  permissions: readonly Permission[]
  search: PlanningSearch
  onClose: () => void
}

export type GoalFormProps = {
  workspaceId: string
  today: IsoDate
  accounts: readonly PlanningAccount[]
  goals: readonly PlanningGoal[]
  defaults: GoalFormValues
  editingGoalId?: string
  onClose: () => void
}

export type GoalFieldsProps = {
  workspaceId: string
  today: IsoDate
  accounts: readonly PlanningAccount[]
  goals: readonly PlanningGoal[]
  editingGoalId?: string
  nameInput: RefObject<HTMLInputElement | null>
}

export type GoalAccountFieldProps = {
  workspaceId: string
  accounts: readonly PlanningAccount[]
  goals: readonly PlanningGoal[]
  editingGoalId?: string
}

export type GoalPreviewProps = {
  workspaceId: string
  accounts: readonly PlanningAccount[]
}

export type GoalFormFooterProps = {
  isOnline: boolean
  problem: string | null
  isEditing: boolean
  onCancel: () => void
}

export type GoalsTabProps = {
  workspaceId: string
  permissions: readonly Permission[]
}

export type GoalsViewProps = {
  workspaceId: string
  goals: readonly PlanningGoal[]
  accounts: ReadonlyMap<string, PlanningAccount>
  steps: readonly AllocationStepItem[]
  coverageMonths: number | null
  permissions: readonly Permission[]
}

export type GoalActionsProps = {
  workspaceId: string
  goal: PlanningGoal
  accountName: string
  steps: readonly AllocationStepItem[]
  permissions: readonly Permission[]
}

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
  triggerLabel?: string
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
  periodLabel?: string
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
  triggerLabel?: string
  className?: string
  children?: ReactNode
}

export type PlanningOverview = Awaited<ReturnType<typeof fetchOverview>>

export type BudgetLine = PlanningOverview['metrics']['budgetPace'][number]

export type BudgetAccounts = ReadonlyMap<
  string,
  Pick<PlanningAccount, 'id' | 'name' | 'parentId' | 'icon' | 'kind' | 'archivedAt'>
>

export type BudgetLineView = {
  categoryAccountId: string
  name: string
  art: { name: string; icon: string | null }
  spentCents: number
  limitCents: number
  status: BudgetStatus
  statusText: string
  subcategories: BudgetChild[]
}

export type UnbudgetedView = {
  categoryAccountId: string
  name: string
  art: { name: string; icon: string | null }
  spentCents: number
}

export type BudgetSheetView = {
  categoryAccountId: string
  name: string
  art: { name: string; icon: string | null }
  childNames: string[]
  limitCents: number | null
  spending: { label: string; amountCents: number }[]
  totalCents: number
  average: { periods: number; amountCents: number } | null
}

export type BudgetSetRequest = {
  categoryId: string
  limitCents: number | null
  fromPeriod: string
}

export type BudgetsTabProps = Omit<PlanningPageProps, 'tab'>

export type BudgetSheetProps = {
  workspaceId: string
  view: BudgetSheetView
  periodLabel: string
  periodOptions: readonly { value: string; label: string }[]
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export type BudgetFormInput = z.input<typeof budgetFormSchema>

export type BudgetsProps = {
  workspaceId: string
  overview: PlanningOverview
  accounts: BudgetAccounts
  canChange: boolean
}

export type UnbudgetedRowProps = {
  category: UnbudgetedView
  onDefine?: () => void
}

export type BudgetSheetViewProps = {
  view: BudgetSheetView
  periodLabel: string
}

export type BudgetsViewProps = {
  overview: PlanningOverview
  lines: BudgetLineView[]
  unbudgeted: UnbudgetedView[]
  onOpen?: (categoryAccountId: string) => void
}
export type RecurrenceFormInput = z.input<typeof recurrenceFormSchema>

export type RecurrenceFormValues = z.output<typeof recurrenceFormSchema>

export type DayRule = (typeof DAY_RULES)[number]

export type PlanningBalance = Awaited<ReturnType<typeof fetchBalances>>[number]

export type RecurrenceEditorProps = {
  workspaceId: string
  permissions: readonly Permission[]
  search: PlanningSearch
  onClose: () => void
}

export type NewRecurrenceProps = {
  workspaceId: string
  entryType: RecurringEntryType
  onClose: () => void
}

export type RecurrenceEdit = {
  ruleId: string
  warning?: string
}

export type RecurrenceFormProps = {
  workspaceId: string
  today: IsoDate
  accounts: readonly PlanningAccount[]
  defaults: RecurrenceFormInput
  edit?: RecurrenceEdit
  onClose: () => void
}

export type RecurrenceFormFooterProps = {
  isOnline: boolean
  problem: string | null
  isEditing: boolean
  onCancel: () => void
}

export type RecurrenceFieldsProps = {
  workspaceId: string
  today: IsoDate
  accounts: readonly PlanningAccount[]
  descriptionInput: RefObject<HTMLInputElement | null>
  isTypeLocked: boolean
}

export type EditRecurrenceProps = {
  workspaceId: string
  ruleId: string
  onClose: () => void
}

export type RecurrenceAccountFieldsProps = {
  workspaceId: string
  accounts: readonly PlanningAccount[]
}

export type RecurrenceScheduleFieldsProps = {
  today: IsoDate
}

export type RecurrencePreviewProps = {
  workspaceId: string
  today: IsoDate
}

export type RecurrencePickerProps = {
  control: FieldControlProps
  title: string
  subtitle?: string
  placeholder: string
  items: readonly PickerItem[]
  layout?: PickerSheetProps['layout']
  searchLabel?: string
  empty?: PickerEmpty
  action?: PickerSheetProps['action']
}

export type ChosenPickerItem = {
  item: PickerItem
  label: string
  icon: string | null | undefined
  parent: PickerItem | undefined
}

export type RecurrenceAmount = {
  amountCents: number
  isEstimate: boolean
}

export type CategoryKind = 'expense_category' | 'income_category' | 'money'

export type OccurrencesTableProps = OccurrencesProps & {
  periodLabel: string
}

export type RecurrencesDesktopProps = {
  workspaceId: string
  list: RecurrenceList
  context: RecurrenceContext
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  addLinkOf: (key: RecurrenceGroupKey) => ReactElement
}

export type RecurrenceKpisProps = {
  list: RecurrenceList
}

export type KpiAmountProps = {
  cents: number
  isEstimate?: boolean
}

export type NextCellProps = {
  item: ListedRecurrence
  today: IsoDate
}

export type RecurrenceCellOptions = {
  workspaceId: string
  canUpdate: boolean
  canDelete: boolean
}

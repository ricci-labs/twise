import type { WorkspaceTransaction } from '@api/core/db/db.types'
import type { AuditTarget } from '@api/modules/audit'
import {
  allocationParts,
  allocationSteps,
  budgetLines,
  goals,
  plannedOccurrences,
  recurrenceRules,
  workspaceHolidays,
} from '@api/modules/planning/planning.table'
import type {
  AllocationPartItem,
  AllocationStepItem,
  BudgetItem,
  GoalRow,
  GoalUpdate,
  HolidayDeletion,
  LockedOccurrence,
  NewAllocationPartRow,
  NewAllocationStepRow,
  NewBudgetLine,
  NewGoalRow,
  NewOccurrenceRow,
  NewRecurrenceRuleRow,
  NewWorkspaceHoliday,
  OccurrenceRow,
  OccurrenceUpdate,
  RecurrenceRuleRow,
  RecurrenceRuleUpdate,
  StepsDeletion,
  WorkspaceHoliday,
} from '@api/modules/planning/planning.types'
import type { IsoDate } from '@financas/shared'
import { and, asc, between, desc, eq, gte, inArray, isNotNull, isNull, lte, min } from 'drizzle-orm'

export function selectHolidaysBetween(
  tx: WorkspaceTransaction,
  start: IsoDate,
  end: IsoDate,
): Promise<WorkspaceHoliday[]> {
  return tx
    .select({
      id: workspaceHolidays.id,
      onDate: workspaceHolidays.onDate,
      name: workspaceHolidays.name,
    })
    .from(workspaceHolidays)
    .where(and(isNull(workspaceHolidays.deletedAt), between(workspaceHolidays.onDate, start, end)))
    .orderBy(asc(workspaceHolidays.onDate))
}

export async function insertHoliday(
  tx: WorkspaceTransaction,
  holiday: NewWorkspaceHoliday,
): Promise<string> {
  const [inserted] = await tx
    .insert(workspaceHolidays)
    .values(holiday)
    .returning({ id: workspaceHolidays.id })
  if (!inserted) {
    throw new Error('Holiday insert returned no row')
  }
  return inserted.id
}

export async function markHolidayDeleted(
  tx: WorkspaceTransaction,
  holidayId: string,
  deletion: HolidayDeletion,
): Promise<boolean> {
  const deleted = await tx
    .update(workspaceHolidays)
    .set(deletion)
    .where(and(eq(workspaceHolidays.id, holidayId), isNull(workspaceHolidays.deletedAt)))
    .returning({ id: workspaceHolidays.id })
  return deleted.length > 0
}

export function selectActiveRules(tx: WorkspaceTransaction): Promise<RecurrenceRuleRow[]> {
  return tx
    .select()
    .from(recurrenceRules)
    .where(isNull(recurrenceRules.deletedAt))
    .orderBy(asc(recurrenceRules.description), asc(recurrenceRules.id))
}

export async function lockActiveRule(
  tx: WorkspaceTransaction,
  ruleId: string,
): Promise<RecurrenceRuleRow | undefined> {
  const [rule] = await tx
    .select()
    .from(recurrenceRules)
    .where(and(eq(recurrenceRules.id, ruleId), isNull(recurrenceRules.deletedAt)))
    .for('update')
  return rule
}

export async function insertRule(
  tx: WorkspaceTransaction,
  rule: NewRecurrenceRuleRow,
): Promise<string> {
  const [inserted] = await tx
    .insert(recurrenceRules)
    .values(rule)
    .returning({ id: recurrenceRules.id })
  if (!inserted) {
    throw new Error('Recurrence rule was not inserted')
  }
  return inserted.id
}

export async function updateRule(
  tx: WorkspaceTransaction,
  ruleId: string,
  update: RecurrenceRuleUpdate,
): Promise<void> {
  await tx.update(recurrenceRules).set(update).where(eq(recurrenceRules.id, ruleId))
}

export async function selectPlannedDueDates(
  tx: WorkspaceTransaction,
  ruleId: string,
): Promise<IsoDate[]> {
  const planned = await tx
    .select({ dueOn: plannedOccurrences.dueOn })
    .from(plannedOccurrences)
    .where(eq(plannedOccurrences.ruleId, ruleId))
  return planned.map((occurrence) => occurrence.dueOn)
}

export async function selectNextPendingDueDates(
  tx: WorkspaceTransaction,
): Promise<Map<string, IsoDate>> {
  const nextDueDates = await tx
    .select({ ruleId: plannedOccurrences.ruleId, nextOn: min(plannedOccurrences.dueOn) })
    .from(plannedOccurrences)
    .where(eq(plannedOccurrences.status, 'pending'))
    .groupBy(plannedOccurrences.ruleId)
  return new Map(
    nextDueDates.flatMap(({ ruleId, nextOn }) => (nextOn ? [[ruleId, nextOn] as const] : [])),
  )
}

export async function deletePendingOccurrences(
  tx: WorkspaceTransaction,
  ruleId: string,
  fromDate: IsoDate | null,
): Promise<void> {
  const pendingOfRule = and(
    eq(plannedOccurrences.ruleId, ruleId),
    eq(plannedOccurrences.status, 'pending'),
  )
  await tx
    .delete(plannedOccurrences)
    .where(fromDate ? and(pendingOfRule, gte(plannedOccurrences.dueOn, fromDate)) : pendingOfRule)
}

export async function insertOccurrencesIfMissing(
  tx: WorkspaceTransaction,
  occurrences: NewOccurrenceRow[],
): Promise<void> {
  await tx
    .insert(plannedOccurrences)
    .values(occurrences)
    .onConflictDoNothing({ target: [plannedOccurrences.ruleId, plannedOccurrences.dueOn] })
}

const OCCURRENCE_COLUMNS = {
  id: plannedOccurrences.id,
  ruleId: plannedOccurrences.ruleId,
  description: recurrenceRules.description,
  entryType: recurrenceRules.entryType,
  sourceAccountId: recurrenceRules.sourceAccountId,
  categoryAccountId: recurrenceRules.categoryAccountId,
  dueOn: plannedOccurrences.dueOn,
  amountCents: plannedOccurrences.amountCents,
  amountIsEstimate: recurrenceRules.amountIsEstimate,
  status: plannedOccurrences.status,
  matchedEntryId: plannedOccurrences.matchedEntryId,
  skippedByUserId: plannedOccurrences.skippedByUserId,
  frequency: recurrenceRules.frequency,
  interval: recurrenceRules.interval,
}

export function selectOccurrencesBetween(
  tx: WorkspaceTransaction,
  from: IsoDate,
  to: IsoDate,
): Promise<OccurrenceRow[]> {
  return tx
    .select(OCCURRENCE_COLUMNS)
    .from(plannedOccurrences)
    .innerJoin(recurrenceRules, eq(recurrenceRules.id, plannedOccurrences.ruleId))
    .where(between(plannedOccurrences.dueOn, from, to))
    .orderBy(asc(plannedOccurrences.dueOn), asc(recurrenceRules.description))
}

export async function selectOccurrenceMatchedTo(
  tx: WorkspaceTransaction,
  entryId: string,
): Promise<OccurrenceRow | undefined> {
  const [occurrence] = await tx
    .select(OCCURRENCE_COLUMNS)
    .from(plannedOccurrences)
    .innerJoin(recurrenceRules, eq(recurrenceRules.id, plannedOccurrences.ruleId))
    .where(eq(plannedOccurrences.matchedEntryId, entryId))
    .limit(1)
  return occurrence
}

export async function selectOccurrence(
  tx: WorkspaceTransaction,
  occurrenceId: string,
): Promise<OccurrenceRow | undefined> {
  const [occurrence] = await tx
    .select(OCCURRENCE_COLUMNS)
    .from(plannedOccurrences)
    .innerJoin(recurrenceRules, eq(recurrenceRules.id, plannedOccurrences.ruleId))
    .where(eq(plannedOccurrences.id, occurrenceId))
  return occurrence
}

export async function selectMatchedEntryIds(tx: WorkspaceTransaction): Promise<Set<string>> {
  const matched = await tx
    .select({ entryId: plannedOccurrences.matchedEntryId })
    .from(plannedOccurrences)
    .where(isNotNull(plannedOccurrences.matchedEntryId))
  return new Set(matched.flatMap(({ entryId }) => (entryId ? [entryId] : [])))
}

export async function lockOccurrence(
  tx: WorkspaceTransaction,
  occurrenceId: string,
): Promise<LockedOccurrence | undefined> {
  const [occurrence] = await tx
    .select(OCCURRENCE_COLUMNS)
    .from(plannedOccurrences)
    .innerJoin(recurrenceRules, eq(recurrenceRules.id, plannedOccurrences.ruleId))
    .where(eq(plannedOccurrences.id, occurrenceId))
    .for('update', { of: plannedOccurrences })
  return occurrence
}

export async function setOccurrenceMatch(
  tx: WorkspaceTransaction,
  occurrenceId: string,
  matchedEntryId: string | null,
): Promise<void> {
  await tx
    .update(plannedOccurrences)
    .set({ status: matchedEntryId ? 'matched' : 'pending', matchedEntryId, skippedByUserId: null })
    .where(eq(plannedOccurrences.id, occurrenceId))
}

export async function updateOccurrence(
  tx: WorkspaceTransaction,
  occurrenceId: string,
  change: OccurrenceUpdate,
): Promise<void> {
  await tx.update(plannedOccurrences).set(change).where(eq(plannedOccurrences.id, occurrenceId))
}

export async function selectBudgetsEffectiveOn(
  tx: WorkspaceTransaction,
  periodStart: IsoDate,
): Promise<BudgetItem[]> {
  const latest = await tx
    .selectDistinctOn([budgetLines.categoryAccountId], {
      categoryAccountId: budgetLines.categoryAccountId,
      limitCents: budgetLines.limitCents,
      validFrom: budgetLines.validFrom,
    })
    .from(budgetLines)
    .where(and(isNull(budgetLines.deletedAt), lte(budgetLines.validFrom, periodStart)))
    .orderBy(budgetLines.categoryAccountId, desc(budgetLines.validFrom))
  return latest.flatMap(({ limitCents, ...line }) =>
    limitCents === null ? [] : [{ ...line, limitCents }],
  )
}

export async function upsertBudgetLine(
  tx: WorkspaceTransaction,
  line: NewBudgetLine,
): Promise<string> {
  const [stored] = await tx
    .insert(budgetLines)
    .values(line)
    .onConflictDoUpdate({
      target: [budgetLines.workspaceId, budgetLines.categoryAccountId, budgetLines.validFrom],
      targetWhere: isNull(budgetLines.deletedAt),
      set: { limitCents: line.limitCents },
    })
    .returning({ id: budgetLines.id })
  if (!stored) {
    throw new Error('Budget line was not stored')
  }
  return stored.id
}

export async function selectActiveBudgetLineId(
  tx: WorkspaceTransaction,
  categoryAccountId: string,
  validFrom: string,
): Promise<string | undefined> {
  const [line] = await tx
    .select({ id: budgetLines.id })
    .from(budgetLines)
    .where(
      and(
        eq(budgetLines.categoryAccountId, categoryAccountId),
        eq(budgetLines.validFrom, validFrom),
        isNull(budgetLines.deletedAt),
      ),
    )
  return line?.id
}

export function selectActiveGoals(tx: WorkspaceTransaction): Promise<GoalRow[]> {
  return tx
    .select()
    .from(goals)
    .where(isNull(goals.deletedAt))
    .orderBy(desc(goals.isReserve), asc(goals.name))
}

export async function lockActiveGoal(
  tx: WorkspaceTransaction,
  goalId: string,
): Promise<GoalRow | undefined> {
  const [goal] = await tx
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), isNull(goals.deletedAt)))
    .for('update')
  return goal
}

export async function insertGoal(tx: WorkspaceTransaction, goal: NewGoalRow): Promise<string> {
  const [inserted] = await tx.insert(goals).values(goal).returning({ id: goals.id })
  if (!inserted) {
    throw new Error('Goal was not inserted')
  }
  return inserted.id
}

export async function updateGoal(
  tx: WorkspaceTransaction,
  goalId: string,
  update: GoalUpdate,
): Promise<void> {
  await tx.update(goals).set(update).where(eq(goals.id, goalId))
}

export function selectAllocationSteps(tx: WorkspaceTransaction): Promise<AllocationStepItem[]> {
  return tx
    .select({
      position: allocationSteps.position,
      kind: allocationSteps.kind,
      goalId: allocationSteps.goalId,
      accountId: allocationSteps.accountId,
      percent: allocationSteps.percent,
      amountCents: allocationSteps.amountCents,
    })
    .from(allocationSteps)
    .where(isNull(allocationSteps.deletedAt))
    .orderBy(asc(allocationSteps.position))
}

export async function markAllocationStepsDeleted(
  tx: WorkspaceTransaction,
  deletion: StepsDeletion,
): Promise<void> {
  await tx.update(allocationSteps).set(deletion).where(isNull(allocationSteps.deletedAt))
}

export async function insertAllocationSteps(
  tx: WorkspaceTransaction,
  steps: NewAllocationStepRow[],
): Promise<void> {
  await tx.insert(allocationSteps).values(steps)
}

export function holidayAuditTarget(workspaceId: string, holidayId: string): AuditTarget {
  return { workspaceId, table: workspaceHolidays, key: workspaceHolidays.id, rowId: holidayId }
}

export function ruleAuditTarget(workspaceId: string, ruleId: string): AuditTarget {
  return { workspaceId, table: recurrenceRules, key: recurrenceRules.id, rowId: ruleId }
}

export function occurrenceAuditTarget(workspaceId: string, occurrenceId: string): AuditTarget {
  return { workspaceId, table: plannedOccurrences, key: plannedOccurrences.id, rowId: occurrenceId }
}

export function budgetLineAuditTarget(workspaceId: string, lineId: string): AuditTarget {
  return { workspaceId, table: budgetLines, key: budgetLines.id, rowId: lineId }
}

export function goalAuditTarget(workspaceId: string, goalId: string): AuditTarget {
  return { workspaceId, table: goals, key: goals.id, rowId: goalId }
}

export function selectAllocationParts(
  tx: WorkspaceTransaction,
  periodLabel: string,
): Promise<AllocationPartItem[]> {
  return tx
    .select({
      position: allocationParts.position,
      toAccountId: allocationParts.toAccountId,
      entryId: allocationParts.entryId,
    })
    .from(allocationParts)
    .where(and(eq(allocationParts.periodLabel, periodLabel), isNull(allocationParts.deletedAt)))
    .orderBy(asc(allocationParts.position))
}

export async function selectLinkedEntryIds(tx: WorkspaceTransaction): Promise<Set<string>> {
  const rows = await tx
    .select({ entryId: allocationParts.entryId })
    .from(allocationParts)
    .where(isNull(allocationParts.deletedAt))
  return new Set(rows.map((row) => row.entryId))
}

export async function insertAllocationPart(
  tx: WorkspaceTransaction,
  part: NewAllocationPartRow,
): Promise<void> {
  await tx.insert(allocationParts).values(part)
}

export function selectRuleNames(tx: WorkspaceTransaction, ruleIds: string[]) {
  return tx
    .select({ id: recurrenceRules.id, name: recurrenceRules.description })
    .from(recurrenceRules)
    .where(inArray(recurrenceRules.id, ruleIds))
}

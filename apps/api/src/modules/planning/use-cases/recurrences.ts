import { systemClock } from '@api/core/clock'
import type { Clock } from '@api/core/clock.types'
import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import { withWorkspace } from '@api/core/db/tx'
import { NotFoundError, parseOrThrow, ValidationError } from '@api/core/http/errors'
import { auditCreation, audited } from '@api/modules/audit'
import { loadUsableAccounts } from '@api/modules/ledger'
import {
  insertRule,
  lockActiveRule,
  ruleAuditTarget,
  selectActiveRules,
  selectNextPendingDueDates,
  updateRule,
} from '@api/modules/planning/planning.repository'
import type {
  CreatedRecurrenceRule,
  DeleteRecurrenceRuleInput,
  PlanningContext,
  RecurrenceRuleItem,
  RecurrenceRuleList,
  RecurrenceRuleRef,
  RecurrenceRuleRow,
} from '@api/modules/planning/planning.types'
import {
  dropPendingOccurrences,
  refreshOccurrences,
  replanRuleOccurrences,
  scheduleOf,
  workspaceToday,
} from '@api/modules/planning/use-cases/occurrences'
import {
  type IsoDate,
  monthlyEquivalentCents,
  newRecurrenceRuleSchema,
  type RecurringEntryType,
  recurrenceRuleChangeSchema,
  recurrenceSummary,
  recurringAccountsFit,
} from '@financas/shared'

const RULE_INVALID = 'RECURRENCE_INVALID'

export function listRecurrenceRules(
  db: Database,
  workspaceId: string,
  clock: Clock = systemClock,
): Promise<RecurrenceRuleList> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const today = await workspaceToday(tx, clock)
    await refreshOccurrences(tx, today)
    const nextDueDates = await selectNextPendingDueDates(tx)
    const rules = await selectActiveRules(tx)
    const items = rules.map((rule) => itemOf(rule, nextDueDates.get(rule.id) ?? null, today))
    const stillRunning = items.filter((item) => runsOnOrAfter(item, today))
    return { items, summary: recurrenceSummary(stillRunning.map(summarizable)) }
  })
}

export async function createRecurrenceRule(
  db: Database,
  { workspaceId }: PlanningContext,
  rawInput: unknown,
  clock: Clock = systemClock,
): Promise<CreatedRecurrenceRule> {
  const { schedule, ...rule } = parseOrThrow(newRecurrenceRuleSchema, rawInput, RULE_INVALID)
  return withWorkspace(db, workspaceId, async (tx) => {
    await assertAccountsFit(tx, rule.entryType, rule.sourceAccountId, rule.categoryAccountId)
    const ruleId = await insertRule(tx, { workspaceId, ...rule, ...schedule })
    await auditCreation(tx, ruleAuditTarget(workspaceId, ruleId))
    await replanRuleOccurrences(
      tx,
      await lockExistingRule(tx, ruleId),
      await workspaceToday(tx, clock),
    )
    return { ruleId }
  })
}

export async function changeRecurrenceRule(
  db: Database,
  { workspaceId, ruleId }: RecurrenceRuleRef,
  rawChange: unknown,
  clock: Clock = systemClock,
): Promise<void> {
  const { schedule, ...change } = parseOrThrow(recurrenceRuleChangeSchema, rawChange, RULE_INVALID)
  await withWorkspace(db, workspaceId, async (tx) => {
    const current = await lockExistingRule(tx, ruleId)
    await assertAccountsFit(
      tx,
      current.entryType,
      change.sourceAccountId ?? current.sourceAccountId,
      change.categoryAccountId ?? current.categoryAccountId,
    )
    await audited(tx, ruleAuditTarget(workspaceId, ruleId), 'update', () =>
      updateRule(tx, ruleId, { ...change, ...schedule }),
    )
    await replanRuleOccurrences(
      tx,
      await lockExistingRule(tx, ruleId),
      await workspaceToday(tx, clock),
    )
  })
}

export async function deleteRecurrenceRule(
  db: Database,
  { workspaceId, ruleId, userId, reason }: DeleteRecurrenceRuleInput,
  clock: Clock = systemClock,
): Promise<void> {
  await withWorkspace(db, workspaceId, async (tx) => {
    await lockExistingRule(tx, ruleId)
    await audited(tx, ruleAuditTarget(workspaceId, ruleId), 'delete', () =>
      updateRule(tx, ruleId, {
        deletedAt: clock.now(),
        deletedByUserId: userId,
        deleteReason: reason ?? null,
      }),
    )
    await dropPendingOccurrences(tx, ruleId)
  })
}

async function lockExistingRule(
  tx: WorkspaceTransaction,
  ruleId: string,
): Promise<RecurrenceRuleRow> {
  const rule = await lockActiveRule(tx, ruleId)
  if (!rule) {
    throw new NotFoundError('RECURRENCE_NOT_FOUND', `Recurrence rule ${ruleId} not found`)
  }
  return rule
}

async function assertAccountsFit(
  tx: WorkspaceTransaction,
  entryType: RecurringEntryType,
  sourceAccountId: string,
  categoryAccountId: string,
): Promise<void> {
  const accounts = await loadUsableAccounts(tx, [sourceAccountId, categoryAccountId])
  const source = accounts.get(sourceAccountId)
  const category = accounts.get(categoryAccountId)
  if (!source || !category || !recurringAccountsFit(entryType, source, category)) {
    throw new ValidationError(
      'RECURRENCE_ACCOUNTS_INVALID',
      `The accounts don't fit a recurring ${entryType}`,
    )
  }
}

function runsOnOrAfter(item: RecurrenceRuleItem, today: IsoDate): boolean {
  return item.schedule.endsOn === null || item.schedule.endsOn >= today
}

function summarizable(item: RecurrenceRuleItem) {
  return { ...item, frequency: item.schedule.frequency, interval: item.schedule.interval }
}

function itemOf(
  row: RecurrenceRuleRow,
  nextOn: IsoDate | null,
  today: IsoDate,
): RecurrenceRuleItem {
  return {
    id: row.id,
    description: row.description,
    entryType: row.entryType,
    amountCents: row.amountCents,
    amountIsEstimate: row.amountIsEstimate,
    sourceAccountId: row.sourceAccountId,
    categoryAccountId: row.categoryAccountId,
    schedule: scheduleOf(row),
    remindDaysBefore: row.remindDaysBefore,
    autoRecord: row.autoRecord,
    nextOn,
    nextIsOverdue: nextOn !== null && nextOn < today,
    monthlyCents: monthlyEquivalentCents(row.amountCents, row),
  }
}

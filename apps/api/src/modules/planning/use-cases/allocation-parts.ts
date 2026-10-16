import { systemClock } from '@api/core/clock'
import type { Clock } from '@api/core/clock.types'
import type { Database } from '@api/core/db/db.types'
import {
  POSTGRES_UNIQUE_VIOLATION,
  postgresConstraintName,
  postgresErrorCode,
} from '@api/core/db/errors'
import { withWorkspace } from '@api/core/db/tx'
import { ConflictError, parseOrThrow, ValidationError } from '@api/core/http/errors'
import { findActiveEntry, readMatchCandidates } from '@api/modules/ledger'
import {
  insertAllocationPart,
  selectAllocationParts,
  selectLinkedEntryIds,
} from '@api/modules/planning/planning.repository'
import type {
  AllocationPartCandidates,
  AllocationPartList,
  PlanningContext,
} from '@api/modules/planning/planning.types'
import { workspaceToday } from '@api/modules/planning/use-cases/occurrences'
import { addDays, allocationPartSchema } from '@financas/shared'

const TRANSFER = 'transfer'
const CANDIDATE_WINDOW_DAYS = 60
const CANDIDATE_LIMIT = 20
const CONFLICT_OF_CONSTRAINT: Record<string, [string, string]> = {
  allocation_parts_one_per_position: [
    'ALLOCATION_PART_TAKEN',
    'This part of the split is already done in the period',
  ],
  allocation_parts_one_per_entry: [
    'ALLOCATION_ENTRY_TAKEN',
    'This transfer is already a part of a split',
  ],
}

export function listAllocationParts(
  db: Database,
  workspaceId: string,
  periodLabel: string,
): Promise<AllocationPartList> {
  return withWorkspace(db, workspaceId, async (tx) => ({
    items: await selectAllocationParts(tx, periodLabel),
  }))
}

export function listAllocationPartCandidates(
  db: Database,
  workspaceId: string,
  toAccountId: string,
  clock: Clock = systemClock,
): Promise<AllocationPartCandidates> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const today = await workspaceToday(tx, clock)
    const linked = await selectLinkedEntryIds(tx)
    const entries = await readMatchCandidates(tx, {
      accountId: toAccountId,
      entryType: TRANSFER,
      from: addDays(today, -CANDIDATE_WINDOW_DAYS),
      to: today,
      limit: CANDIDATE_LIMIT,
    })
    return {
      items: entries
        .filter((entry) => !linked.has(entry.id) && arrivesIn(entry.postings, toAccountId))
        .map((entry) => ({
          entryId: entry.id,
          description: entry.description,
          occurredOn: entry.occurredOn,
          amountCents: entry.amountCents,
        })),
    }
  })
}

export async function recordAllocationPart(
  db: Database,
  { workspaceId, userId }: PlanningContext,
  rawInput: unknown,
): Promise<void> {
  const part = parseOrThrow(allocationPartSchema, rawInput, 'ALLOCATION_PART_INVALID')
  await refusingTakenParts(() =>
    withWorkspace(db, workspaceId, async (tx) => {
      const entry = await findActiveEntry(tx, part.entryId)
      if (!entry || entry.entryType !== TRANSFER || !arrivesIn(entry.postings, part.toAccountId)) {
        throw new ValidationError(
          'ALLOCATION_ENTRY_INVALID',
          'A split part is an active transfer into the part account',
        )
      }
      await insertAllocationPart(tx, { workspaceId, recordedByUserId: userId, ...part })
    }),
  )
}

function arrivesIn(
  postings: readonly { accountId: string; amountCents: number }[],
  accountId: string,
): boolean {
  return postings.some((posting) => posting.accountId === accountId && posting.amountCents > 0)
}

async function refusingTakenParts<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (error) {
    const conflict = CONFLICT_OF_CONSTRAINT[postgresConstraintName(error) ?? '']
    if (postgresErrorCode(error) === POSTGRES_UNIQUE_VIOLATION && conflict) {
      throw new ConflictError(conflict[0], conflict[1], { cause: error })
    }
    throw error
  }
}

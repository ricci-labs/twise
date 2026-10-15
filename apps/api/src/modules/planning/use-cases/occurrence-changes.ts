import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import { withWorkspace } from '@api/core/db/tx'
import { ConflictError, parseOrThrow } from '@api/core/http/errors'
import { audited } from '@api/modules/audit'
import { occurrenceAuditTarget, updateOccurrence } from '@api/modules/planning/planning.repository'
import type {
  OccurrenceChangeRef,
  OccurrenceRef,
  OccurrenceUpdate,
} from '@api/modules/planning/planning.types'
import { lockExistingOccurrence } from '@api/modules/planning/use-cases/occurrences'
import { type OccurrenceStatus, occurrenceChangeSchema } from '@financas/shared'

export async function skipOccurrence(
  db: Database,
  { userId, ...ref }: OccurrenceChangeRef,
): Promise<void> {
  await moveStatus(db, ref, 'pending', { status: 'skipped', skippedByUserId: userId })
}

export async function unskipOccurrence(db: Database, ref: OccurrenceRef): Promise<void> {
  await moveStatus(db, ref, 'skipped', { status: 'pending', skippedByUserId: null })
}

export async function changeOccurrenceAmount(
  db: Database,
  { workspaceId, occurrenceId }: OccurrenceRef,
  rawChange: unknown,
): Promise<void> {
  const { amountCents } = parseOrThrow(occurrenceChangeSchema, rawChange, 'OCCURRENCE_INVALID')
  await withWorkspace(db, workspaceId, async (tx) => {
    await lockInStatus(tx, occurrenceId, 'pending')
    await audited(tx, occurrenceAuditTarget(workspaceId, occurrenceId), 'update', () =>
      updateOccurrence(tx, occurrenceId, { amountCents }),
    )
  })
}

async function moveStatus(
  db: Database,
  { workspaceId, occurrenceId }: OccurrenceRef,
  from: OccurrenceStatus,
  change: OccurrenceUpdate,
): Promise<void> {
  await withWorkspace(db, workspaceId, async (tx) => {
    await lockInStatus(tx, occurrenceId, from)
    await audited(tx, occurrenceAuditTarget(workspaceId, occurrenceId), 'update', () =>
      updateOccurrence(tx, occurrenceId, change),
    )
  })
}

async function lockInStatus(
  tx: WorkspaceTransaction,
  occurrenceId: string,
  expected: OccurrenceStatus,
): Promise<void> {
  const occurrence = await lockExistingOccurrence(tx, occurrenceId)
  if (occurrence.status !== expected) {
    throw new ConflictError(
      `OCCURRENCE_NOT_${expected.toUpperCase()}`,
      `Occurrence ${occurrenceId} is ${occurrence.status}, not ${expected}`,
    )
  }
}

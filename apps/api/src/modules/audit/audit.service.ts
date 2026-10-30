import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import { withWorkspace } from '@api/core/db/tx'
import { currentOperation } from '@api/core/observability/operation-context'
import {
  insertAuditRow,
  selectAuditedRow,
  selectAuditRows,
  selectLatestActivity,
  tableNameOf,
} from '@api/modules/audit/audit.repository'
import type {
  AuditActor,
  AuditChange,
  AuditEvent,
  AuditItem,
  AuditTarget,
} from '@api/modules/audit/audit.types'
import { listAccounts } from '@api/modules/identity'
import { type AuditAction, type AuditQuery, type Page, pageOf } from '@financas/shared'

export async function recordAudit(tx: WorkspaceTransaction, change: AuditChange): Promise<void> {
  const { traceId, source, actorUserId } = currentOperation()
  await insertAuditRow(tx, {
    ...change,
    actorUserId: change.actorUserId ?? actorUserId,
    before: change.before ?? null,
    after: change.after ?? null,
    traceId,
    source,
  })
}

export async function auditCreation(tx: WorkspaceTransaction, target: AuditTarget): Promise<void> {
  await recordAudit(tx, {
    workspaceId: target.workspaceId,
    action: 'create',
    tableName: tableNameOf(target),
    rowId: target.rowId,
    after: await selectAuditedRow(tx, target),
  })
}

export async function audited<T>(
  tx: WorkspaceTransaction,
  target: AuditTarget,
  action: AuditAction,
  change: () => Promise<T>,
): Promise<T> {
  const before = await selectAuditedRow(tx, target)
  const result = await change()
  await recordAudit(tx, {
    workspaceId: target.workspaceId,
    action,
    tableName: tableNameOf(target),
    rowId: target.rowId,
    before,
    after: await selectAuditedRow(tx, target),
  })
  return result
}

export async function listAuditEvents(
  db: Database,
  workspaceId: string,
  query: AuditQuery,
): Promise<Page<AuditItem>> {
  const page = await withWorkspace(db, workspaceId, async (tx) =>
    pageOf(await selectAuditRows(tx, query), query.limit, (event) => ({
      key: event.at.toISOString(),
      id: event.id,
    })),
  )
  const actors = await actorsOf(db, page.items)
  return {
    ...page,
    items: page.items.map((event) => ({
      ...event,
      actor: event.actorUserId ? (actors.get(event.actorUserId) ?? null) : null,
    })),
  }
}

export async function readLatestActivity(tx: WorkspaceTransaction): Promise<Map<string, Date>> {
  const activity = await selectLatestActivity(tx)
  return new Map(activity.map(({ actorUserId, at }) => [actorUserId, at]))
}

async function actorsOf(db: Database, events: AuditEvent[]): Promise<Map<string, AuditActor>> {
  const actorIds = [...new Set(events.flatMap((event) => event.actorUserId ?? []))]
  const accounts = await listAccounts(db, actorIds)
  return new Map(
    accounts.map((account) => [account.userId, { id: account.userId, name: account.displayName }]),
  )
}

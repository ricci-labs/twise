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
  AuditName,
  AuditNames,
  AuditTarget,
  NamedRow,
} from '@api/modules/audit/audit.types'
import {
  entityLabelOf,
  readReferencedNames,
  referencedIds,
} from '@api/modules/audit/use-cases/labels'
import { listAccounts } from '@api/modules/identity'
import { type AuditAction, type AuditQuery, auditAreaOf, type Page, pageOf } from '@financas/shared'

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
  names: AuditNames,
  workspaceId: string,
  query: AuditQuery,
): Promise<Page<AuditItem>> {
  const { page, referenced } = await withWorkspace(db, workspaceId, async (tx) => {
    const found = pageOf(await selectAuditRows(tx, query), query.limit, (event) => ({
      key: event.at.toISOString(),
      id: event.id,
    }))
    return { page: found, referenced: await readReferencedNames(tx, names, found.items) }
  })
  const users = await userNamesOf(db, page.items)
  const allNames = new Map([...referenced, ['user', users] as const])
  return {
    ...page,
    items: page.items.map((event) => ({
      ...event,
      actor: actorOf(event, users),
      area: auditAreaOf(event.tableName),
      entityLabel: entityLabelOf(event, allNames),
    })),
  }
}

export async function readLatestActivity(tx: WorkspaceTransaction): Promise<Map<string, Date>> {
  const activity = await selectLatestActivity(tx)
  return new Map(activity.map(({ actorUserId, at }) => [actorUserId, at]))
}

async function userNamesOf(
  db: Database,
  events: AuditEvent[],
): Promise<ReadonlyMap<string, AuditName>> {
  const actorIds = events.flatMap((event) => event.actorUserId ?? [])
  const userIds = [...new Set([...actorIds, ...referencedIds(events, 'user')])]
  const accounts = await listAccounts(db, userIds)
  return namesById(accounts.map((account) => ({ id: account.userId, name: account.displayName })))
}

function actorOf(event: AuditEvent, users: ReadonlyMap<string, AuditName>): AuditActor | null {
  const name = event.actorUserId ? users.get(event.actorUserId)?.name : undefined
  return event.actorUserId && name ? { id: event.actorUserId, name } : null
}

export function namesById(rows: NamedRow[]): ReadonlyMap<string, AuditName> {
  return new Map(
    rows.map(({ id, name, parentName }) => [id, { name, parentName: parentName ?? null }]),
  )
}

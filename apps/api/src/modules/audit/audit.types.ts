import type { Database } from '@api/core/db/db.types'
import type { auditLog } from '@api/modules/audit/audit.table'
import type { AuditAction } from '@financas/shared'
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'

export type AuditRow = typeof auditLog.$inferSelect

export type NewAuditRow = typeof auditLog.$inferInsert

export type AuditChange = {
  workspaceId: string
  actorUserId?: string | null
  action: AuditAction
  tableName: string
  rowId: string
  before?: unknown
  after?: unknown
}

export type AuditEvent = Omit<AuditRow, 'workspaceId'>

export type AuditActor = {
  id: string
  name: string
}

export type ActorActivity = {
  actorUserId: string
  at: Date
}

export type AuditItem = AuditEvent & {
  actor: AuditActor | null
}

export type AuditRouteDeps = {
  db: Database
}

export type AuditTarget = {
  workspaceId: string
  table: PgTable
  key: PgColumn
  rowId: string
  hidden?: readonly string[]
}

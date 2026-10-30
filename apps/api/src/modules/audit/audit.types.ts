import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import type { auditLog } from '@api/modules/audit/audit.table'
import type {
  AuditAction,
  AuditArea,
  AuditRawChange,
  AuditRawValue,
  AuditReferenceKind,
} from '@financas/shared'
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

export type AuditValue = AuditRawValue | AuditName

export type AuditFieldChange = Omit<AuditRawChange, 'before' | 'after'> & {
  before: AuditValue
  after: AuditValue
}

export type DescribedEvent = {
  event: AuditEvent
  changes: AuditRawChange[]
}

export type AuditItem = AuditEvent & {
  actor: AuditActor | null
  area: AuditArea | null
  entityLabel: string | null
  changes: AuditFieldChange[]
}

export type AuditName = {
  name: string
  parentName: string | null
}

export type NamedRow = {
  id: string
  name: string
  parentName?: string | null
}

export type AuditNameLookup = (
  tx: WorkspaceTransaction,
  ids: string[],
) => Promise<ReadonlyMap<string, AuditName>>

export type AuditNameKind = AuditReferenceKind | 'charge'

export type AuditNames = Record<Exclude<AuditNameKind, 'user'>, AuditNameLookup>

export type LabelReference = {
  kind: AuditNameKind
  field: string | null
}

export type AuditRouteDeps = {
  db: Database
  names: AuditNames
}

export type AuditTarget = {
  workspaceId: string
  table: PgTable
  key: PgColumn
  rowId: string
  hidden?: readonly string[]
}

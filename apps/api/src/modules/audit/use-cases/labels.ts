import type { WorkspaceTransaction } from '@api/core/db/db.types'
import type {
  AuditEvent,
  AuditFieldChange,
  AuditName,
  AuditNameKind,
  AuditNames,
  AuditValue,
  DescribedEvent,
  LabelReference,
} from '@api/modules/audit/audit.types'
import type { AuditRawChange, AuditRawValue } from '@financas/shared'

const SNAPSHOT_LABELS: Readonly<Record<string, readonly string[]>> = {
  journal_entries: ['description'],
  ledger_accounts: ['name'],
  contacts: ['name'],
  recurrence_rules: ['description'],
  goals: ['name'],
  workspace_holidays: ['name'],
  roles: ['name'],
  invitations: ['email', 'phoneE164'],
  workspaces: ['name'],
  entry_attachments: ['name'],
  charge_attachments: ['name'],
}

const REFERENCE_LABELS: Readonly<Record<string, LabelReference>> = {
  card_details: { kind: 'account', field: null },
  charges: { kind: 'contact', field: 'contactId' },
  charge_payments: { kind: 'charge', field: 'chargeId' },
  planned_occurrences: { kind: 'rule', field: 'ruleId' },
  budget_lines: { kind: 'account', field: 'categoryAccountId' },
  role_permissions: { kind: 'role', field: null },
  memberships: { kind: 'user', field: 'userId' },
  membership_preferences: { kind: 'user', field: null },
}

export function referencedIds(described: DescribedEvent[], kind: AuditNameKind): string[] {
  const ids = described.flatMap(({ event, changes }) => {
    const reference = REFERENCE_LABELS[event.tableName]
    const labelId = reference?.kind === kind ? referencedIdOf(event, reference) : null
    const changeIds = changes
      .filter((change) => change.reference === kind)
      .flatMap((change) => [change.before, change.after].filter(isId))
    return [...(labelId ? [labelId] : []), ...changeIds]
  })
  return [...new Set(ids)]
}

export async function readReferencedNames(
  tx: WorkspaceTransaction,
  names: AuditNames,
  events: DescribedEvent[],
): Promise<Map<AuditNameKind, ReadonlyMap<string, AuditName>>> {
  const kinds = Object.keys(names) as (keyof AuditNames)[]
  const found = await Promise.all(
    kinds.map(async (kind) => [kind, await names[kind](tx, referencedIds(events, kind))] as const),
  )
  return new Map(found)
}

export function entityLabelOf(
  event: AuditEvent,
  names: ReadonlyMap<AuditNameKind, ReadonlyMap<string, AuditName>>,
): string | null {
  const reference = REFERENCE_LABELS[event.tableName]
  if (reference) {
    const id = referencedIdOf(event, reference)
    return (id && names.get(reference.kind)?.get(id)?.name) || null
  }
  const snapshot = snapshotOf(event)
  const fields = SNAPSHOT_LABELS[event.tableName] ?? []
  const label = fields.map((field) => snapshot[field]).find((value) => typeof value === 'string')
  return typeof label === 'string' && label !== '' ? label : null
}

export function resolvedChange(
  change: AuditRawChange,
  names: ReadonlyMap<AuditNameKind, ReadonlyMap<string, AuditName>>,
): AuditFieldChange {
  const { reference } = change
  if (!reference) {
    return change
  }
  const resolve = (value: AuditRawValue): AuditValue =>
    isId(value) ? (names.get(reference)?.get(value) ?? null) : null
  return { ...change, before: resolve(change.before), after: resolve(change.after) }
}

function isId(value: AuditRawValue): value is string {
  return typeof value === 'string' && value !== ''
}

function referencedIdOf(event: AuditEvent, reference: LabelReference): string | null {
  if (reference.field === null) {
    return event.rowId
  }
  const id = snapshotOf(event)[reference.field]
  return typeof id === 'string' ? id : null
}

function snapshotOf(event: AuditEvent): Record<string, unknown> {
  const snapshot = event.after ?? event.before
  return isRecord(snapshot) ? snapshot : {}
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

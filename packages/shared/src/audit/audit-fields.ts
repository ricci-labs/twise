import { AUDIT_FIELDS } from '@shared/audit/audit-fields.constants'
import type {
  AuditedPosting,
  AuditedTable,
  AuditFieldSpec,
  AuditRawChange,
  AuditRawValue,
} from '@shared/audit/audit-fields.types'
import { accountClassOf, entryAmountCents, isSystemAccountKind } from '@shared/ledger/ledger/ledger'
import { ACCOUNT_KINDS, type AccountKind } from '@shared/ledger/ledger/ledger.constants'

const ENTRIES_TABLE = 'journal_entries'
const CATEGORY_CLASSES = new Set(['income', 'expense'])

export function auditChangesOf(
  tableName: string,
  before: unknown,
  after: unknown,
): AuditRawChange[] {
  const specs: readonly AuditFieldSpec[] = AUDIT_FIELDS[tableName as AuditedTable] ?? []
  const was = fieldsOf(tableName, before)
  const is = fieldsOf(tableName, after)
  return specs.flatMap((spec) => {
    const beforeValue = was[spec.field] ?? null
    const afterValue = is[spec.field] ?? null
    if (beforeValue === null && afterValue === null) {
      return []
    }
    return [
      {
        field: spec.field as AuditRawChange['field'],
        kind: spec.kind,
        reference: spec.reference ?? null,
        before: beforeValue,
        after: afterValue,
        changed: beforeValue !== afterValue,
      },
    ]
  })
}

function fieldsOf(tableName: string, snapshot: unknown): Record<string, AuditRawValue> {
  if (!isRecord(snapshot)) {
    return {}
  }
  const values = Object.fromEntries(
    Object.entries(snapshot).map(([field, value]) => [field, rawValueOf(value)]),
  )
  return tableName === ENTRIES_TABLE ? { ...values, ...entryFieldsOf(snapshot.postings) } : values
}

function entryFieldsOf(postings: unknown): Record<string, AuditRawValue> {
  const entryPostings = Array.isArray(postings) ? postings.filter(isAuditedPosting) : []
  if (entryPostings.length === 0) {
    return {}
  }
  const kindOf = (posting: AuditedPosting) => posting.accountKind as AccountKind
  const category = entryPostings.find((posting) =>
    CATEGORY_CLASSES.has(accountClassOf(kindOf(posting))),
  )
  const account = entryPostings.find(
    (posting) =>
      !CATEGORY_CLASSES.has(accountClassOf(kindOf(posting))) &&
      !isSystemAccountKind(kindOf(posting)),
  )
  return {
    amountCents: entryAmountCents(entryPostings),
    categoryId: category?.accountId ?? null,
    accountId: account?.accountId ?? null,
  }
}

function isAuditedPosting(value: unknown): value is AuditedPosting {
  return (
    isRecord(value) &&
    typeof value.accountId === 'string' &&
    typeof value.amountCents === 'number' &&
    (ACCOUNT_KINDS as readonly unknown[]).includes(value.accountKind)
  )
}

function rawValueOf(value: unknown): AuditRawValue {
  const isPrimitive = ['string', 'number', 'boolean'].includes(typeof value)
  return isPrimitive ? (value as AuditRawValue) : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

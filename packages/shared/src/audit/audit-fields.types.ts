import type {
  AUDIT_FIELD_KINDS,
  AUDIT_FIELDS,
  AUDIT_REFERENCE_KINDS,
} from '@shared/audit/audit-fields.constants'

export type AuditFieldKind = (typeof AUDIT_FIELD_KINDS)[number]

export type AuditReferenceKind = (typeof AUDIT_REFERENCE_KINDS)[number]

export type AuditFieldSpec = {
  field: string
  kind: AuditFieldKind
  reference?: AuditReferenceKind
}

export type AuditedTable = keyof typeof AUDIT_FIELDS

export type AuditFieldKey = (typeof AUDIT_FIELDS)[AuditedTable][number]['field']

export type AuditRawValue = string | number | boolean | null

export type AuditRawChange = {
  field: AuditFieldKey
  kind: AuditFieldKind
  reference: AuditReferenceKind | null
  before: AuditRawValue
  after: AuditRawValue
  changed: boolean
}

export type AuditedPosting = {
  accountId: string
  accountKind: string
  amountCents: number
}

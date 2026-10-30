import { AUDIT_AREA_KEYS, AUDIT_AREAS, type AuditArea } from '@shared/audit/audit.constants'

export function auditAreaOf(tableName: string): AuditArea | null {
  return (
    AUDIT_AREA_KEYS.find((area) => (AUDIT_AREAS[area] as readonly string[]).includes(tableName)) ??
    null
  )
}

import { auditAreaOf } from '@shared/audit/audit'
import { describe, expect, it } from 'vitest'

describe('auditAreaOf', () => {
  it('places each audited table in the area the history filters by', () => {
    expect(auditAreaOf('journal_entries')).toBe('entries')
    expect(auditAreaOf('charge_payments')).toBe('charges')
    expect(auditAreaOf('workspace_holidays')).toBe('planning')
    expect(auditAreaOf('role_permissions')).toBe('members')
    expect(auditAreaOf('workspace_settings')).toBe('settings')
  })

  it('has no area for a table it does not know', () => {
    expect(auditAreaOf('somewhere_else')).toBeNull()
  })
})

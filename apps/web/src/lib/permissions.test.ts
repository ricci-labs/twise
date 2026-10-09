import { hasPermission, isReadOnly } from '@web/lib/permissions'
import { describe, expect, it } from 'vitest'

describe('permissions', () => {
  it('finds a granted module and action', () => {
    const permissions = [{ module: 'entries', action: 'view' }] as const
    expect(hasPermission(permissions, 'entries', 'view')).toBe(true)
    expect(hasPermission(permissions, 'entries', 'create')).toBe(false)
  })

  it('reads a role that can only view as read-only', () => {
    expect(isReadOnly([{ module: 'entries', action: 'view' }])).toBe(true)
    expect(
      isReadOnly([
        { module: 'entries', action: 'view' },
        { module: 'entries', action: 'create' },
      ]),
    ).toBe(false)
  })
})

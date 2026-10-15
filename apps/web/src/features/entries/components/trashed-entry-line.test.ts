import type { IsoDate } from '@financas/shared'
import { deletedLineOf } from '@web/features/entries/components/trashed-entry-line'
import { describe, expect, it } from 'vitest'

describe('deletedLineOf', () => {
  it('says the time for today and the date for another day, in the household time zone', () => {
    const today = '2026-10-20' as IsoDate
    expect(deletedLineOf('2026-10-20T17:12:00.000Z', 'Member A', today)).toBe(
      'Excluído hoje, 14:12, por Member A',
    )
    expect(deletedLineOf('2026-10-18T12:00:00.000Z', 'Member B', today)).toBe(
      'Excluído em 18/10 por Member B',
    )
    expect(deletedLineOf('2026-10-21T02:00:00.000Z', undefined, today)).toBe('Excluído hoje, 23:00')
  })
})

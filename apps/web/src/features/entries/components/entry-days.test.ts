import type { IsoDate } from '@financas/shared'
import { entryDaysOf } from '@web/features/entries/components/entry-days'
import type { ListedEntry } from '@web/features/entries/entries.types'
import { describe, expect, it } from 'vitest'

const TODAY = '2026-10-20' as IsoDate

function on(id: string, occurredOn: string) {
  return { id, occurredOn } as ListedEntry
}

describe('entryDaysOf', () => {
  it('groups the entries by day, naming today and yesterday', () => {
    const days = entryDaysOf(
      [on('a', '2026-10-20'), on('b', '2026-10-20'), on('c', '2026-10-19'), on('d', '2026-10-17')],
      TODAY,
    )

    expect(days.map(({ title, detail, entries }) => [title, detail, entries.length])).toEqual([
      ['Hoje', 'ter, 20 out', 2],
      ['Ontem', 'seg, 19 out', 1],
      ['sáb, 17 out', undefined, 1],
    ])
  })
})

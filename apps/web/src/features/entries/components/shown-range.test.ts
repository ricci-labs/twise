import type { IsoDate, PeriodsOfYear } from '@financas/shared'
import {
  listFilterOf,
  presetRangeOf,
  shownRangeOf,
} from '@web/features/entries/components/shown-range'
import { describe, expect, it } from 'vitest'

const PERIODS: PeriodsOfYear = {
  today: '2026-10-20' as IsoDate,
  currentLabel: '2026-10',
  periods: [
    { label: '2026-09', start: '2026-09-05' as IsoDate, end: '2026-10-04' as IsoDate },
    { label: '2026-10', start: '2026-10-05' as IsoDate, end: '2026-11-04' as IsoDate },
  ],
}

describe('shownRangeOf', () => {
  it('shows the current period by default, or the one in the address', () => {
    expect(shownRangeOf({}, PERIODS)).toMatchObject({
      kind: 'period',
      title: 'out/26',
      detail: '5 out – 4 nov',
    })
    expect(shownRangeOf({ period: '2026-09' }, PERIODS)).toMatchObject({ title: 'set/26' })
    expect(shownRangeOf({ period: '2025-01' }, PERIODS)).toBeUndefined()
  })

  it('names a preset range and shows a chosen one by its dates', () => {
    const from = '2026-09-21' as IsoDate
    const to = '2026-10-20' as IsoDate
    expect(shownRangeOf({ from, to, preset: 'last30Days' }, PERIODS)).toMatchObject({
      kind: 'range',
      title: 'Últimos 30 dias',
      detail: '21 set – 20 out',
    })
    expect(shownRangeOf({ from, to }, PERIODS)).toMatchObject({ title: '21 set – 20 out' })
  })
})

describe('listFilterOf', () => {
  const october = shownRangeOf({}, PERIODS)

  it('asks for the period, the search from its second letter and the filters', () => {
    if (!october) {
      throw new Error('no period')
    }
    expect(listFilterOf({ q: ' m ', types: ['expense'], shared: true }, october)).toEqual({
      from: '2026-10-05',
      to: '2026-11-04',
      q: undefined,
      types: ['expense'],
      accountId: undefined,
      categoryId: undefined,
      spentByUserId: undefined,
      shared: true,
    })
    expect(listFilterOf({ q: 'merc', everywhere: true }, october)).toMatchObject({ q: 'merc' })
    expect(listFilterOf({ q: 'merc', everywhere: true }, october).from).toBeUndefined()
  })
})

describe('presetRangeOf', () => {
  it('counts the last 30 days with today, and this year from January to December', () => {
    const today = '2026-10-20' as IsoDate
    expect(presetRangeOf('last30Days', today)).toEqual({ from: '2026-09-21', to: '2026-10-20' })
    expect(presetRangeOf('thisYear', today)).toEqual({ from: '2026-01-01', to: '2026-12-31' })
  })
})

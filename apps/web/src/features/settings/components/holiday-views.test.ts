import { holidayListsOf, holidaySummaryText } from '@web/features/settings/components/holiday-views'
import type { HolidaysOfYear } from '@web/features/settings/settings.types'
import { describe, expect, it } from 'vitest'

const HOLIDAYS: HolidaysOfYear = {
  national: [
    { on: '2026-10-12', key: 'our_lady_aparecida', affects: [] },
    { on: '2026-11-02', key: 'all_souls_day', affects: [] },
    { on: '2026-11-15', key: 'republic_day', affects: [] },
  ],
  workspace: [
    { id: 'h2', onDate: '2026-12-08', name: 'Padroeira da cidade', affects: [] },
    { id: 'h1', onDate: '2026-01-25', name: 'Aniversário da cidade', affects: [] },
  ],
  summary: {
    total: 5,
    national: 3,
    workspace: 2,
    next: { onDate: '2026-11-02', daysAway: 17, nationalKey: 'all_souls_day', name: null },
  },
}

describe('holidayListsOf', () => {
  it('names the national ones in pt-BR and marks the past ones and the next', () => {
    const { national } = holidayListsOf(HOLIDAYS, '2026-10-16')
    expect(national.map(({ name, status }) => `${name} ${status}`)).toEqual([
      'Nossa Senhora Aparecida past',
      'Finados next',
      'Proclamação da República upcoming',
    ])
  })

  it('orders the workspace ones by date and keeps their ids for deleting', () => {
    const { workspace } = holidayListsOf(HOLIDAYS, '2026-10-16')
    expect(workspace.map(({ holidayId, status }) => `${holidayId} ${status}`)).toEqual([
      'h1 past',
      'h2 upcoming',
    ])
  })
})

describe('holidaySummaryText', () => {
  it('says how many there are in the year and which comes next', () => {
    expect(holidaySummaryText(HOLIDAYS.summary, 2026)).toBe('5 em 2026 · próximo: Finados, 02/11')
  })

  it('uses the workspace name of the next one, and leaves it out when there is none', () => {
    const local = {
      ...HOLIDAYS.summary,
      next: { onDate: '2026-12-08', daysAway: 53, nationalKey: null, name: 'Padroeira' },
    }
    expect(holidaySummaryText(local, 2026)).toBe('5 em 2026 · próximo: Padroeira, 08/12')
    expect(holidaySummaryText({ ...HOLIDAYS.summary, next: null }, 2100)).toBe('5 em 2100')
  })
})

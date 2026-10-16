import { demoPeriodsOf, nationalHolidays } from '@financas/shared'
import { WORKSPACE_ID } from '@web/testing/fake-api'
import type { FakeAnswer, FakeWorkspaceHoliday } from '@web/testing/testing.types'

const BASE = `/api/workspaces/${WORKSPACE_ID}`

export const CITY_BIRTHDAY = '00000000-0000-4000-8000-0000000007a1'

export const CITY_PATRON = '00000000-0000-4000-8000-0000000007a2'

export const WORKSPACE_HOLIDAYS: readonly FakeWorkspaceHoliday[] = [
  { id: CITY_BIRTHDAY, onDate: '2026-01-25', name: 'Aniversário da cidade' },
  { id: CITY_PATRON, onDate: '2026-12-08', name: 'Padroeira da cidade' },
]

const ALL_SOULS_DAY = {
  onDate: '2026-11-02',
  daysAway: 13,
  nationalKey: 'all_souls_day',
  name: null,
}

export function holidaysAnswer(
  workspace: readonly FakeWorkspaceHoliday[] = WORKSPACE_HOLIDAYS,
): Record<string, FakeAnswer> {
  return {
    [`GET ${BASE}/periods`]: () => Response.json(demoPeriodsOf(2026)),
    [`GET ${BASE}/holidays`]: (request) => {
      const year = Number(new URL(request.url).searchParams.get('year'))
      const national = nationalHolidays(year).map((holiday) => ({ ...holiday, affects: [] }))
      const ofYear = workspace
        .filter((holiday) => holiday.onDate.startsWith(String(year)))
        .map((holiday) => ({ ...holiday, affects: [] }))
      return Response.json({
        national,
        workspace: ofYear,
        summary: {
          total: national.length + ofYear.length,
          national: national.length,
          workspace: ofYear.length,
          next: ALL_SOULS_DAY,
        },
      })
    },
  }
}

import { demoPeriodsOf, nationalHolidays } from '@financas/shared'
import { WORKSPACE_ID } from '@web/testing/fake-api'
import type { FakeAnswer, FakeWorkspaceHoliday } from '@web/testing/testing.types'

const BASE = `/api/workspaces/${WORKSPACE_ID}`

export const WORKSPACE_PIX = {
  pixReceivingKey: 'member.a@exemplo.com',
  pixReceiverName: 'MEMBER A',
  pixReceiverCity: 'SAO PAULO',
}

export const NO_PIX = { pixReceivingKey: null, pixReceiverName: null, pixReceiverCity: null }

export function workspaceSettingsAnswer(
  pix: Readonly<Record<string, string | null>> = WORKSPACE_PIX,
): Record<string, FakeAnswer> {
  return {
    [`GET ${BASE}/settings`]: () =>
      Response.json({
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        locale: 'pt-BR',
        periodAnchor: 'calendar_month',
        periodAnchorValue: null,
        installmentBudgetView: 'per_installment',
        budgetBase: 'fixed_income',
        weekStartsOn: 0,
        ...pix,
        contactMessagesDailyCap: 20,
        chargeReminderEveryDays: null,
      }),
  }
}

export const CITY_BIRTHDAY = '00000000-0000-4000-8000-0000000007a1'

export const CITY_PATRON = '00000000-0000-4000-8000-0000000007a2'

export const WORKSPACE_HOLIDAYS: readonly FakeWorkspaceHoliday[] = [
  { id: CITY_BIRTHDAY, onDate: '2026-01-25', name: 'Aniversário da cidade' },
  { id: CITY_PATRON, onDate: '2026-12-08', name: 'Padroeira da cidade' },
]

export const MEAL_VOUCHER_RULE = '00000000-0000-4000-8000-0000000007b1'

const MEAL_VOUCHER_MOVE = {
  recurrenceId: MEAL_VOUCHER_RULE,
  description: 'Vale-alimentação',
  fromOn: '2026-11-02',
  toOn: '2026-11-03',
}

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
      const national = nationalHolidays(year).map((holiday) => ({
        ...holiday,
        affects: holiday.on === ALL_SOULS_DAY.onDate ? [MEAL_VOUCHER_MOVE] : [],
      }))
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

export const DEFAULT_TEXT = {
  subject: '{quem cobra} te enviou uma cobrança de {valor}',
  opening:
    '{quem cobra} pediu para te lembrar do que está em aberto. Dá para pagar com Pix, o valor já vem preenchido.',
  closing: null,
  isDefault: true,
}

export const WORKSPACE_TEXT = {
  subject: 'Cobrança de {quem cobra}: {valor}',
  opening: 'Oi! Aqui é {quem cobra}. Passando para lembrar da nossa conta do mês.',
  closing: 'Qualquer coisa me chama.',
  isDefault: false,
}

export function chargeTextAnswer(
  text: Readonly<Record<string, string | boolean | null>> = DEFAULT_TEXT,
): Record<string, FakeAnswer> {
  return {
    [`GET ${BASE}/settings/charge-text`]: () => Response.json(text),
    [`GET ${BASE}/periods`]: () => Response.json(demoPeriodsOf(2026)),
  }
}

import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accessAs,
  account,
  apiError,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { expectClampedToTwoLines } from '@web/testing/long-text'
import { CITY_PATRON, holidaysAnswer, WORKSPACE_HOLIDAYS } from '@web/testing/settings-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const HOLIDAYS_PATH = `/w/${WORKSPACE_ID}/settings/holidays`
const LONG_NAME = 'Aniversário da cidade e padroeira municipal com feriado prolongado'
const CONFLICT = 409

async function openHolidays({
  path = HOLIDAYS_PATH,
  access = workspaceAccess,
  answers = {},
}: {
  path?: string
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
} = {}) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...holidaysAnswer(),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
  await render(<AppProviders app={app} />)
  return app
}

describe('PLAN-07 holidays under Configurações', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('shows the year, the note, the workspace ones and the national ones with the next marked', async () => {
    await openHolidays()
    await expect.element(page.getByRole('heading', { name: 'Feriados', level: 1 })).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Voltar para Configurações' }))
      .toHaveAttribute('href', `/w/${WORKSPACE_ID}/settings`)
    await expect
      .element(page.getByRole('navigation', { name: 'Ano dos feriados' }))
      .toHaveTextContent('2026')
    await expect.element(page.getByText(/Previstos já planejados não mudam de data/)).toBeVisible()
    const workspace = page.getByRole('region', { name: /Do espaço/ })
    await expect.element(workspace.getByText('Aniversário da cidade')).toBeVisible()
    await expect.element(workspace.getByText('dom · cai no fim de semana')).toBeVisible()
    const national = page.getByRole('region', { name: /Nacionais \(bancários\)/ })
    await expect.element(national.getByText('Já vêm no app e não mudam.')).toBeVisible()
    await expect.element(national.getByText('Sexta-feira Santa')).toBeVisible()
    await expect.element(national.getByText('Próximo')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Mais' }))
      .toHaveAttribute('aria-current', 'page')
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('moves to another year and asks the API for it', async () => {
    const app = await openHolidays()
    await page.getByRole('button', { name: 'Próximo ano' }).click()
    await expect.poll(() => app.router.state.location.search).toMatchObject({ year: 2027 })
    await expect
      .element(page.getByRole('navigation', { name: 'Ano dos feriados' }))
      .toHaveTextContent('2027')
    await expect
      .element(page.getByText('Nenhum feriado do espaço.', { exact: false }))
      .toBeVisible()
  })

  it('says there are no workspace holidays with examples', async () => {
    await openHolidays({ answers: holidaysAnswer([]) })
    await expect
      .element(
        page.getByText(/Adicione os da cidade de vocês \(aniversário da cidade, padroeiro\)/),
      )
      .toBeVisible()
  })

  it('adds a holiday and says the next fixed bills count it', async () => {
    const sent: unknown[] = []
    await openHolidays({
      answers: {
        [`POST ${BASE}/holidays`]: async (request) => {
          sent.push(await request.json())
          return Response.json({ holidayId: CITY_PATRON }, { status: 201 })
        },
      },
    })
    await page.getByRole('button', { name: 'Adicionar feriado' }).click()
    const sheet = page.getByRole('dialog', { name: 'Adicionar feriado' })
    await expect.element(sheet.getByText(/Vale todo ano\? Adicione um por ano/)).toBeVisible()
    await sheet.getByRole('button', { name: /Data/ }).click()
    await page.getByRole('dialog', { name: 'Data' }).getByRole('radio', { name: /^30/ }).click()
    await sheet.getByRole('textbox', { name: /Nome/ }).fill('Dia do município')
    await sheet.getByRole('button', { name: 'Adicionar feriado' }).click()
    await expect.poll(() => sent).toEqual([{ onDate: '2026-10-30', name: 'Dia do município' }])
    await expect
      .element(page.getByText('Feriado adicionado. As próximas contas fixas já contam com ele.'))
      .toBeVisible()
  })

  it('says on the date field that the day is already a national holiday', async () => {
    await openHolidays()
    await page.getByRole('button', { name: 'Adicionar feriado' }).click()
    const sheet = page.getByRole('dialog', { name: 'Adicionar feriado' })
    await sheet.getByRole('button', { name: /Data/ }).click()
    await page.getByRole('dialog', { name: 'Data' }).getByRole('radio', { name: /^12/ }).click()
    await expect.element(sheet.getByText('Esse dia já é feriado nacional.')).toBeVisible()
    await expectNoAccessibilityViolations(sheet.element())
  })

  it('puts a refusal of the date from the API on the date field', async () => {
    await openHolidays({
      answers: { [`POST ${BASE}/holidays`]: () => apiError('HOLIDAY_DATE_TAKEN', CONFLICT) },
    })
    await page.getByRole('button', { name: 'Adicionar feriado' }).click()
    const sheet = page.getByRole('dialog', { name: 'Adicionar feriado' })
    await sheet.getByRole('button', { name: /Data/ }).click()
    await page.getByRole('dialog', { name: 'Data' }).getByRole('radio', { name: /^29/ }).click()
    await sheet.getByRole('textbox', { name: /Nome/ }).fill('Outro')
    await sheet.getByRole('button', { name: 'Adicionar feriado' }).click()
    await expect.element(sheet.getByText('Já existe um feriado nesse dia.')).toBeVisible()
  })

  it('asks before deleting and says which day counts again', async () => {
    const deleted: string[] = []
    await openHolidays({
      answers: {
        [`DELETE ${BASE}/holidays/${CITY_PATRON}`]: () => {
          deleted.push(CITY_PATRON)
          return new Response(null, { status: 204 })
        },
      },
    })
    await page.getByRole('button', { name: 'Ações de Padroeira da cidade' }).click()
    await page.getByRole('button', { name: 'Excluir' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Excluir Padroeira da cidade (08/12)?' })
    await expect
      .element(
        dialog.getByText(/voltam a contar o dia 8 como útil, a partir dos próximos previstos/),
      )
      .toBeVisible()
    await dialog.getByRole('button', { name: 'Excluir' }).click()
    await expect.poll(() => deleted).toEqual([CITY_PATRON])
    await expect.element(page.getByText('Feriado excluído.')).toBeVisible()
  })

  it('shows a reader the list with no add and no actions', async () => {
    await openHolidays({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })
    await expect.element(page.getByText('Padroeira da cidade')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Adicionar feriado' }))
      .not.toBeInTheDocument()
    await expect
      .element(page.getByRole('button', { name: 'Ações de Padroeira da cidade' }))
      .not.toBeInTheDocument()
  })

  it('keeps a long holiday name to two lines on a 360 px phone', async () => {
    await openHolidays({
      answers: holidaysAnswer([
        { ...WORKSPACE_HOLIDAYS[1], id: CITY_PATRON, onDate: '2026-12-08', name: LONG_NAME },
      ]),
    })
    const name = page.getByText(LONG_NAME)
    await expect.element(name).toBeVisible()
    expectClampedToTwoLines(name.element())
  })

  it('sends the old planning address to the holidays', async () => {
    const app = await openHolidays({ path: `/w/${WORKSPACE_ID}/planning/holidays` })
    await expect.element(page.getByRole('heading', { name: 'Feriados', level: 1 })).toBeVisible()
    expect(app.router.state.location.pathname).toBe(HOLIDAYS_PATH)
  })

  it('marks Configurações in the desktop menu with the path above the title', async () => {
    await page.viewport(1280, 900)
    await openHolidays()
    const menu = page.getByRole('navigation', { name: 'Menu principal' })
    await expect
      .element(menu.getByRole('link', { name: 'Configurações' }))
      .toHaveAttribute('aria-current', 'page')
    await expect
      .element(
        page
          .getByRole('navigation', { name: 'Caminho' })
          .getByRole('link', { name: 'Configurações' }),
      )
      .toBeVisible()
  })
})

describe('PLAN-07 the year as a calendar on the desktop', () => {
  beforeEach(async () => {
    await page.viewport(1440, 1400)
  })

  it('shows the next holiday with the bill it moves, the workspace ones, the legend and the 12 months', async () => {
    await openHolidays()
    await expect
      .element(page.getByText(/Os nacionais já vêm no app; os do espaço vocês adicionam/))
      .toBeVisible()
    await expect
      .element(page.getByRole('navigation', { name: 'Ano dos feriados' }))
      .toHaveTextContent('2026')
    const next = page.getByRole('region', { name: 'Próximo feriado' })
    await expect.element(next.getByText('Finados')).toBeVisible()
    await expect.element(next.getByText(/Segunda-feira · daqui a 13 dias/)).toBeVisible()
    await expect
      .element(next.getByText('Muda 1 conta fixa: Vale-alimentação passa para 03/11.'))
      .toBeVisible()
    const workspace = page.getByRole('region', { name: 'Do espaço · 2' })
    await expect.element(workspace.getByText('Domingo · já passou')).toBeVisible()
    await expect.element(workspace.getByText('08 dez')).toBeVisible()
    const legend = page.getByRole('region', { name: 'Como ler' })
    await expect.element(legend.getByText(/Feriado nacional \(bancário\) · 13/)).toBeVisible()
    await expect.element(legend.getByText(/Feriado do espaço · 2/)).toBeVisible()
    const months = page.getByRole('region', { name: 'Os meses de 2026' })
    expect(months.getByRole('heading', { level: 3 }).elements()).toHaveLength(12)
    const december = months.getByRole('region', { name: 'Dezembro' })
    await expect.element(december.getByText('Padroeira da cidade')).toBeVisible()
    await expect.element(december.getByText('espaço', { exact: true })).toBeVisible()
    await expect
      .element(months.getByRole('region', { name: 'Março' }).getByText('Sem feriados'))
      .toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('adds a holiday from the button beside the year, in a dialog', async () => {
    await openHolidays()
    await page.getByRole('button', { name: 'Adicionar feriado' }).click()
    const dialog = page.getByRole('dialog', { name: 'Adicionar feriado' })
    await expect.element(dialog.getByText(/Vale todo ano\? Adicione um por ano/)).toBeVisible()
  })

  it('deletes a workspace holiday from its card', async () => {
    const deleted: string[] = []
    await openHolidays({
      answers: {
        [`DELETE ${BASE}/holidays/${CITY_PATRON}`]: () => {
          deleted.push(CITY_PATRON)
          return new Response(null, { status: 204 })
        },
      },
    })
    await page.getByRole('button', { name: 'Ações de Padroeira da cidade' }).click()
    await page.getByRole('menuitem', { name: 'Excluir' }).click()
    await page
      .getByRole('alertdialog', { name: 'Excluir Padroeira da cidade (08/12)?' })
      .getByRole('button', { name: 'Excluir' })
      .click()
    await expect.poll(() => deleted).toEqual([CITY_PATRON])
  })

  it('shows a reader the calendar with no add and no actions', async () => {
    await openHolidays({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })
    await expect.element(page.getByRole('region', { name: 'Como ler' })).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Adicionar feriado' }))
      .not.toBeInTheDocument()
    await expect
      .element(page.getByRole('button', { name: 'Ações de Padroeira da cidade' }))
      .not.toBeInTheDocument()
  })

  it('keeps a long workspace holiday to two lines in its card and in its month', async () => {
    await openHolidays({
      answers: holidaysAnswer([
        { ...WORKSPACE_HOLIDAYS[1], id: CITY_PATRON, onDate: '2026-12-08', name: LONG_NAME },
      ]),
    })
    const workspace = page.getByRole('region', { name: 'Do espaço · 1' })
    const december = page.getByRole('region', { name: 'Dezembro' })
    await expect.element(workspace.getByText(LONG_NAME)).toBeVisible()
    expectClampedToTwoLines(workspace.getByText(LONG_NAME).element())
    expectClampedToTwoLines(december.getByText(LONG_NAME).element())
  })
})

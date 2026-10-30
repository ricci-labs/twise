import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accessAs,
  account,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { workspaceSettingsAnswer } from '@web/testing/settings-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const CALENDAR_PATH = `/w/${WORKSPACE_ID}/settings/calendar`
const MEMBER_PERMISSIONS = [...VIEWER_PERMISSIONS, { module: 'settings', action: 'view' }]

async function openCalendar({
  access = workspaceAccess,
  answers = {},
}: {
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
} = {}) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...workspaceSettingsAnswer(),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [CALENDAR_PATH] }))
  await render(<AppProviders app={app} />)
  return app
}

function weekday(name: string) {
  return page.getByRole('group', { name: 'A semana começa no' }).getByRole('button', { name })
}

function zoneField() {
  return page.getByRole('button', { name: /^Fuso horário/ })
}

function saveButton() {
  return page.getByRole('button', { name: 'Salvar calendário' })
}

function recordPatches(sent: unknown[]): Record<string, FakeAnswer> {
  return {
    [`PATCH ${BASE}/settings`]: async (request) => {
      sent.push(await request.json())
      return Response.json({})
    },
  }
}

describe('SET-01 Calendário e fuso', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('shows the first weekday and the time zone with where it applies', async () => {
    await openCalendar()
    await expect
      .element(page.getByRole('heading', { name: 'Calendário e fuso', level: 1 }))
      .toBeVisible()
    await expect.element(weekday('Domingo')).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => zoneField().element().textContent).toMatch(/Brasília\s\(GMT-3\)/)
    await expect
      .poll(() => zoneField().element().textContent)
      .toMatch(/São Paulo, Rio, Minas, Sul e boa parte do país/)
    await expect
      .element(page.getByText('Vale para lembretes, vencimentos e o "hoje" do app.'))
      .toBeVisible()
    await expect.element(saveButton()).toBeDisabled()
    await expectNoAccessibilityViolations(document.body)
  })

  it('lists the Brazilian zones first and saves the weekday and the zone together', async () => {
    const sent: unknown[] = []
    await openCalendar({ answers: recordPatches(sent) })
    await userEvent.click(weekday('Segunda-feira'))
    await userEvent.click(zoneField())
    const sheet = page.getByRole('dialog', { name: 'Fuso horário' })
    await expect.element(sheet.getByText('Do Brasil primeiro.')).toBeVisible()
    await userEvent.click(sheet.getByRole('button', { name: /Amazonas\s\(GMT-4\)/ }))
    await expect.poll(() => zoneField().element().textContent).toMatch(/Amazonas\s\(GMT-4\)/)
    await userEvent.click(saveButton())

    await expect.element(page.getByText('Configurações salvas.')).toBeVisible()
    expect(sent).toEqual([{ weekStartsOn: 1, timezone: 'America/Manaus' }])
  })

  it('finds any other zone by city under "Outros países"', async () => {
    const sent: unknown[] = []
    await openCalendar({ answers: recordPatches(sent) })
    await userEvent.click(zoneField())
    await userEvent.click(
      page
        .getByRole('dialog', { name: 'Fuso horário' })
        .getByRole('button', { name: /Outros países/ }),
    )
    const others = page.getByRole('dialog', { name: 'Outros países' })
    await userEvent.fill(others.getByRole('searchbox', { name: 'Buscar cidade ou fuso' }), 'Lisbon')
    await userEvent.click(others.getByRole('button', { name: /^Lisbon/ }))
    await expect.poll(() => zoneField().element().textContent).toMatch(/Lisbon\s\(GMT/)
    await userEvent.click(saveButton())

    await expect.element(page.getByText('Configurações salvas.')).toBeVisible()
    expect(sent).toEqual([{ weekStartsOn: 0, timezone: 'Europe/Lisbon' }])
  })

  it('shows a member the calendar disabled, the lock note and no save', async () => {
    await openCalendar({ access: () => accessAs('Membro', MEMBER_PERMISSIONS) })
    await expect
      .element(page.getByText('Só donos e admins mudam as configurações. Peça a um deles.'))
      .toBeVisible()
    await expect.element(weekday('Segunda-feira')).toBeDisabled()
    await expect.element(zoneField()).toBeDisabled()
    expect(saveButton().query()).toBeNull()
  })
})

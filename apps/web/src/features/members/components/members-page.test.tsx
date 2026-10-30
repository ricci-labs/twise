import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  account,
  apiError,
  fakeApi,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { manyMembers, membersAnswer } from '@web/testing/members-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const SERVER_ERROR = 500

async function openMembers(answers: Record<string, FakeAnswer> = membersAnswer()) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/members`] }))
  await render(<AppProviders app={app} />)
  return app
}

describe('MEM-01 Membros', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('lists the people with their e-mail, role and since when, marking you', async () => {
    await openMembers()
    await expect.element(page.getByRole('heading', { name: 'Membros', level: 1 })).toBeVisible()
    const people = page.getByRole('region', { name: '2 pessoas' })
    const rows = people.getByRole('listitem')
    await expect.element(rows.nth(0).getByText('Member A', { exact: true })).toBeVisible()
    await expect.element(rows.nth(0).getByText('você')).toBeVisible()
    await expect.element(rows.nth(0).getByText('member.a@exemplo.com')).toBeVisible()
    await expect.element(rows.nth(0).getByText('Dono')).toBeVisible()
    await expect.element(rows.nth(1).getByText('Desde 03/10/2026')).toBeVisible()
    expect(rows.nth(1).getByText('você').query()).toBeNull()
    await expect
      .element(page.getByText(/Só um dono dá o papel de dono ou muda outro dono/))
      .toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('shows 50 people at a time and the rest on "Mostrar mais"', async () => {
    await openMembers(membersAnswer(manyMembers(53)))
    const people = page.getByRole('region', { name: '53 pessoas' })
    await expect.element(people.getByText('Member 50', { exact: true })).toBeVisible()
    expect(people.getByText('Member 51', { exact: true }).query()).toBeNull()
    await userEvent.click(page.getByRole('button', { name: /Mostrar mais/ }))
    await expect.element(people.getByText('Member 53', { exact: true })).toBeVisible()
  })

  it('says when the list could not load', async () => {
    await openMembers({
      [`GET /api/workspaces/${WORKSPACE_ID}/members`]: () => apiError('INTERNAL', SERVER_ERROR),
    })
    await expect.element(page.getByText('Não foi possível carregar os membros.')).toBeVisible()
  })
})

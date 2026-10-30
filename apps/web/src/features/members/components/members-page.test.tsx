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
import { manyMembers, membersAnswer } from '@web/testing/members-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const SERVER_ERROR = 500
const CONFLICT = 409
const NO_CONTENT = 204
const MEMBER_PERMISSIONS = [...VIEWER_PERMISSIONS, { module: 'members', action: 'view' }]

async function openMembers(
  answers: Record<string, FakeAnswer> = membersAnswer(),
  access: FakeAnswer = workspaceAccess,
) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: access,
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

  it('removes someone with an optional reason', async () => {
    const sent: unknown[] = []
    await openMembers({
      ...membersAnswer(),
      [`DELETE /api/workspaces/${WORKSPACE_ID}/members/membership-b`]: async (request) => {
        sent.push(await request.json())
        return new Response(null, { status: NO_CONTENT })
      },
    })
    await page.getByRole('button', { name: 'Ações de Member B' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Remover do espaço' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Remover Member B do espaço?' })
    await userEvent.fill(
      dialog.getByRole('textbox', { name: 'Motivo (opcional)' }),
      'Mudou de casa',
    )
    await dialog.getByRole('button', { name: 'Remover' }).click()

    await expect.element(page.getByText('Member B não faz mais parte do espaço.')).toBeVisible()
    expect(sent).toEqual([{ reason: 'Mudou de casa' }])
  })

  it('offers to make someone else owner when the last owner tries to leave', async () => {
    const patched: unknown[] = []
    await openMembers({
      ...membersAnswer(),
      [`POST /api/workspaces/${WORKSPACE_ID}/members/leave`]: () =>
        apiError('LAST_OWNER', CONFLICT),
      [`PATCH /api/workspaces/${WORKSPACE_ID}/members/membership-b`]: async (request) => {
        patched.push(await request.json())
        return new Response(null, { status: NO_CONTENT })
      },
    })
    await page.getByRole('button', { name: 'Ações de Member A' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Sair do espaço' }).click()
    await page
      .getByRole('alertdialog', { name: 'Sair do espaço Casa?' })
      .getByRole('button', { name: 'Sair do espaço' })
      .click()

    const lastOwner = page.getByRole('alertdialog', { name: 'Você é o único dono do Casa' })
    await expect
      .element(lastOwner.getByText(/Dê o papel de dono a Member B antes de sair/))
      .toBeVisible()
    await lastOwner.getByRole('button', { name: 'Tornar Member B dono' }).click()
    await expect.element(page.getByText('Member B agora é dono do espaço.')).toBeVisible()
    expect(patched).toEqual([{ roleId: 'role-owner' }])
  })

  it('goes back to the workspace choice after leaving', async () => {
    const app = await openMembers({
      ...membersAnswer(),
      [`POST /api/workspaces/${WORKSPACE_ID}/members/leave`]: () =>
        new Response(null, { status: NO_CONTENT }),
    })
    await page.getByRole('button', { name: 'Ações de Member A' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Sair do espaço' }).click()
    await page
      .getByRole('alertdialog', { name: 'Sair do espaço Casa?' })
      .getByRole('button', { name: 'Sair do espaço' })
      .click()

    await expect.poll(() => app.router.state.location.pathname).toBe('/workspaces')
  })

  it('shows no actions on other rows to whoever cannot remove, but keeps "Sair" on yours', async () => {
    await openMembers(membersAnswer(), () => accessAs('Membro', MEMBER_PERMISSIONS))
    await expect.element(page.getByRole('button', { name: 'Ações de Member A' })).toBeVisible()
    expect(page.getByRole('button', { name: 'Ações de Member B' }).query()).toBeNull()
  })
})

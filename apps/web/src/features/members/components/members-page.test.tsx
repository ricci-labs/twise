import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accessAs,
  account,
  apiError,
  fakeApi,
  MEMBER_B_ID,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import {
  ADMIN_HOUSEHOLD,
  invitationsAnswer,
  manyMembers,
  membersAnswer,
  PENDING_INVITATIONS,
  rolesAnswer,
} from '@web/testing/members-api'
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
  path = `/w/${WORKSPACE_ID}/members`,
) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: access,
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
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

  it('opens the history of someone and your own account from the row menus', async () => {
    const app = await openMembers()
    await page.getByRole('button', { name: 'Ações de Member A' }).click()
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Minha conta' }))
      .toBeVisible()
    await userEvent.keyboard('{Escape}')

    await page.getByRole('button', { name: 'Ações de Member B' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Ver no histórico' }).click()

    await expect
      .poll(() => app.router.state.location.href)
      .toBe(`/w/${WORKSPACE_ID}/history?actor=${MEMBER_B_ID}`)
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

  it("changes someone's role from the role cards", async () => {
    const patched: unknown[] = []
    await openMembers({
      ...membersAnswer(),
      ...rolesAnswer(),
      [`PATCH /api/workspaces/${WORKSPACE_ID}/members/membership-b`]: async (request) => {
        patched.push(await request.json())
        return new Response(null, { status: NO_CONTENT })
      },
    })
    await page.getByRole('button', { name: 'Ações de Member B' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Mudar papel' }).click()
    const sheet = page.getByRole('dialog', { name: 'Papel de Member B' })
    await expect
      .element(sheet.getByRole('radio', { name: /Admin/ }))
      .toHaveAttribute('aria-checked', 'true')
    await expect
      .element(sheet.getByText('Lança, edita e planeja. Só vê contas, orçamentos e configurações.'))
      .toBeVisible()
    await sheet.getByRole('radio', { name: /Membro/ }).click()
    await sheet.getByRole('button', { name: 'Mudar papel' }).click()

    await expect.element(page.getByText('Member B agora é Membro.')).toBeVisible()
    expect(patched).toEqual([{ roleId: 'role-member' }])
  })

  it("keeps the owner role and roles beyond the admin's own permissions out of reach", async () => {
    const adminPermissions = [
      ...VIEWER_PERMISSIONS,
      ...['view', 'create', 'update', 'delete'].map((action) => ({ module: 'settings', action })),
      { module: 'members', action: 'view' },
      { module: 'members', action: 'update' },
    ]
    await openMembers({ ...membersAnswer(ADMIN_HOUSEHOLD), ...rolesAnswer() }, () =>
      accessAs('Admin', adminPermissions),
    )
    await page.getByRole('button', { name: 'Ações de Member B' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Mudar papel' }).click()
    const sheet = page.getByRole('dialog', { name: 'Papel de Member B' })

    await expect.element(sheet.getByRole('radio', { name: /Dono/ })).toBeDisabled()
    await expect.element(sheet.getByRole('radio', { name: /Contador/ })).toBeDisabled()
    await expect.element(sheet.getByRole('radio', { name: /Admin/ })).toBeEnabled()
  })

  it('opens Papéis from the tabs, with who uses each role and what it can do', async () => {
    const app = await openMembers({ ...membersAnswer(), ...rolesAnswer() })
    await page.getByRole('button', { name: 'Papéis' }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/members/roles`)
    await expect
      .element(page.getByRole('button', { name: 'Papéis' }))
      .toHaveAttribute('aria-pressed', 'true')
    await expect
      .element(page.getByText('O que cada papel pode ver e fazer no espaço Casa.'))
      .toBeVisible()
    const cards = page.getByRole('listitem')
    await expect.element(cards.nth(0).getByText('Não pode ser alterado')).toBeVisible()
    await expect.element(cards.nth(1).getByText('1 pessoa')).toBeVisible()
    await expect.element(cards.nth(2).getByText('1 convite')).toBeVisible()
    await expect.element(cards.nth(3).getByText('Do espaço')).toBeVisible()
    await expect
      .element(cards.nth(3).getByText('Vê tudo e anexa comprovantes. Não muda valores.'))
      .toBeVisible()
    await expect.element(cards.nth(3).getByText('Ninguém')).toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('counts the pending invitations on their tab and lists them', async () => {
    const app = await openMembers({ ...membersAnswer(), ...rolesAnswer(), ...invitationsAnswer() })
    await page.getByRole('button', { name: 'Convites 2' }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/members/invitations`)
    const pending = page.getByRole('region', { name: 'Pendentes' })
    const rows = pending.getByRole('listitem')
    await expect.element(rows.nth(0).getByText('member.c@exemplo.com')).toBeVisible()
    await expect.element(rows.nth(0).getByText('Contador')).toBeVisible()
    await expect.element(rows.nth(0).getByText('Convidado por Member A em 17/10')).toBeVisible()
    await expect.element(rows.nth(1).getByText('+55 (11) 99999-0005')).toBeVisible()
    await expect.element(rows.nth(1).getByText('Link mostrado uma vez')).toBeVisible()
    await expect
      .element(page.getByText('Convites aceitos viram membros; vencidos somem da lista.'))
      .toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('revokes an invitation after confirming', async () => {
    let revoked = false
    await openMembers(
      {
        ...membersAnswer(),
        ...rolesAnswer(),
        [`GET /api/workspaces/${WORKSPACE_ID}/invitations`]: () =>
          Response.json(revoked ? PENDING_INVITATIONS.slice(1) : PENDING_INVITATIONS),
        [`DELETE /api/workspaces/${WORKSPACE_ID}/invitations/invitation-c`]: () => {
          revoked = true
          return new Response(null, { status: NO_CONTENT })
        },
      },
      workspaceAccess,
      `/w/${WORKSPACE_ID}/members/invitations`,
    )
    await page.getByRole('button', { name: 'Ações do convite para member.c@exemplo.com' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Revogar' }).click()
    await page
      .getByRole('alertdialog', { name: 'Revogar o convite para member.c@exemplo.com?' })
      .getByRole('button', { name: 'Revogar' })
      .click()

    await expect.element(page.getByText('Convite revogado.')).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Convites 1' })).toBeVisible()
    expect(page.getByText('member.c@exemplo.com').query()).toBeNull()
  })

  it('explains what an invitation is when there is none', async () => {
    await openMembers(
      { ...membersAnswer(), ...rolesAnswer(), ...invitationsAnswer([]) },
      workspaceAccess,
      `/w/${WORKSPACE_ID}/members/invitations`,
    )
    await expect.element(page.getByText('Nenhum convite pendente.')).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Convites', exact: true })).toBeVisible()
  })

  it('shows members, the newest invitations and the roles as cards on the desktop', async () => {
    await page.viewport(1440, 1100)
    await openMembers({ ...membersAnswer(), ...rolesAnswer(), ...invitationsAnswer() })
    await expect
      .element(page.getByText('Quem participa do espaço Casa e o que cada um pode fazer.'))
      .toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Convidar' })).toBeVisible()
    const members = page.getByRole('region', { name: 'Membros · 2' })
    const memberRows = members.getByRole('row')
    await expect
      .element(members.getByRole('columnheader', { name: 'Última atividade' }))
      .toBeVisible()
    await expect.element(memberRows.nth(1).getByText('você')).toBeVisible()
    await expect.element(memberRows.nth(1).getByText('02/10/2026')).toBeVisible()
    await expect.element(memberRows.nth(2).getByText('—')).toBeVisible()
    await expect
      .element(memberRows.nth(2).getByRole('button', { name: 'Ações de Member B' }))
      .toBeVisible()
    const invitations = page.getByRole('region', { name: 'Convites pendentes · 2' })
    await expect.element(invitations.getByText('member.c@exemplo.com')).toBeVisible()
    await expect.element(invitations.getByText('em 17/10')).toBeVisible()
    const roles = page.getByRole('region', { name: 'Papéis · 4' })
    await expect
      .element(roles.getByRole('link', { name: /Contador/ }).getByText('Do espaço · Ninguém'))
      .toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('lists the roles as a table and what each can do as a matrix on the desktop', async () => {
    await page.viewport(1440, 1300)
    await openMembers(
      { ...membersAnswer(), ...rolesAnswer(), ...invitationsAnswer() },
      workspaceAccess,
      `/w/${WORKSPACE_ID}/members/roles`,
    )
    await expect.element(page.getByRole('link', { name: 'Novo papel' })).toBeVisible()
    const table = page.getByRole('region', { name: 'Papéis · 4' })
    await expect.element(table.getByRole('img', { name: 'Não pode ser alterado' })).toBeVisible()
    await expect.element(table.getByRole('link', { name: 'Abrir Contador' })).toBeVisible()
    await expect.element(table.getByText('Do espaço')).toBeVisible()
    const matrix = page.getByRole('region', { name: 'O que cada papel pode' })
    const members = matrix.getByRole('row', { name: /^Membros/ })
    await expect.element(members.getByRole('cell').nth(0)).toHaveTextContent('Tudo')
    await expect.element(members.getByRole('cell').nth(1)).toHaveTextContent('Ver, editar')
    await expect.element(members.getByRole('cell').nth(3)).toHaveTextContent('Excluir')
    const reports = matrix.getByRole('row', { name: /^Relatórios/ })
    await expect.element(reports.getByRole('cell').nth(0)).toHaveTextContent('—')
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })
})

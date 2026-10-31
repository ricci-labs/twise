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
import { invitationsAnswer, membersAnswer, rolesAnswer } from '@web/testing/members-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const ROLES_PATH = `/w/${WORKSPACE_ID}/members/roles`
const CREATED = 201
const NO_CONTENT = 204
const CONFLICT = 409

async function openEditor(
  path: string,
  answers: Record<string, FakeAnswer> = {},
  access: FakeAnswer = workspaceAccess,
) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...membersAnswer(),
    ...rolesAnswer(),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
  await render(<AppProviders app={app} />)
  return app
}

function area(name: string) {
  return page.getByRole('group', { name, exact: true })
}

describe('MEM-02 role editor', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('creates a role from a preset, adjusted by hand, and goes back to Papéis', async () => {
    const sent: unknown[] = []
    const app = await openEditor(`${ROLES_PATH}/new`, {
      [`POST ${BASE}/roles`]: async (request) => {
        sent.push(await request.json())
        return Response.json({}, { status: CREATED })
      },
    })
    await expect.element(page.getByRole('heading', { name: 'Novo papel', level: 1 })).toBeVisible()
    expect(page.getByRole('navigation', { name: 'Navegação', exact: true }).query()).toBeNull()
    await userEvent.fill(page.getByRole('textbox', { name: 'Nome do papel' }), 'Contador')
    await userEvent.fill(page.getByRole('textbox', { name: 'Descrição' }), 'Vê tudo.')
    await page.getByRole('button', { name: 'Membro', exact: true }).click()
    await expect
      .element(area('Configurações').getByRole('button', { name: 'Ver' }))
      .toHaveAttribute('aria-pressed', 'true')
    await area('Comprovantes').getByRole('button', { name: 'Criar' }).click()
    await page.getByRole('button', { name: 'Criar papel' }).click()

    await expect.element(page.getByText('Papel Contador criado.')).toBeVisible()
    await expect.poll(() => app.router.state.location.pathname).toBe(ROLES_PATH)
    expect(sent).toEqual([
      {
        name: 'Contador',
        description: 'Vê tudo.',
        permissions: [
          { module: 'settings', action: 'view' },
          { module: 'attachments', action: 'view' },
          { module: 'attachments', action: 'create' },
        ],
      },
    ])
  })

  it('puts a taken name under the field', async () => {
    await openEditor(`${ROLES_PATH}/new`, {
      [`POST ${BASE}/roles`]: () => apiError('ROLE_NAME_TAKEN', CONFLICT),
    })
    await userEvent.fill(page.getByRole('textbox', { name: 'Nome do papel' }), 'Admin')
    await area('Lançamentos').getByRole('button', { name: 'Ver' }).click()
    await page.getByRole('button', { name: 'Criar papel' }).click()

    await expect.element(page.getByText('Já existe um papel com esse nome.')).toBeVisible()
  })

  it('edits a role, saving only after a change', async () => {
    const sent: unknown[] = []
    await openEditor(`${ROLES_PATH}/role-accountant`, {
      [`PATCH ${BASE}/roles/role-accountant`]: async (request) => {
        sent.push(await request.json())
        return new Response(null, { status: NO_CONTENT })
      },
    })
    await expect.element(page.getByRole('heading', { name: 'Contador', level: 1 })).toBeVisible()
    await expect
      .element(page.getByRole('textbox', { name: 'Nome do papel' }))
      .toHaveValue('Contador')
    await expect.element(page.getByRole('button', { name: 'Salvar papel' })).toBeDisabled()
    await userEvent.fill(page.getByRole('textbox', { name: 'Descrição' }), 'Só olha.')
    await page.getByRole('button', { name: 'Salvar papel' }).click()

    await expect.element(page.getByText('Papel Contador salvo.')).toBeVisible()
    expect(sent).toEqual([
      {
        name: 'Contador',
        description: 'Só olha.',
        permissions: [{ module: 'members', action: 'delete' }],
      },
    ])
  })

  it('shows the owner role read only', async () => {
    await openEditor(`${ROLES_PATH}/role-owner`)
    await expect.element(page.getByText('O papel Dono não pode ser alterado.')).toBeVisible()
    await expect
      .element(page.getByRole('textbox', { name: 'Nome do papel' }))
      .toHaveAttribute('readonly')
    expect(page.getByRole('button', { name: 'Salvar papel' }).query()).toBeNull()
  })

  it('locks what an admin cannot give and says why', async () => {
    const adminPermissions = [
      ...VIEWER_PERMISSIONS,
      { module: 'members', action: 'view' },
      { module: 'members', action: 'create' },
      { module: 'members', action: 'update' },
    ]
    await openEditor(`${ROLES_PATH}/new`, {}, () => accessAs('Admin', adminPermissions))
    await expect
      .element(
        page.getByText(
          'As permissões com cadeado você não tem, então não pode dar. Peça a um dono.',
        ),
      )
      .toBeVisible()
    await expect.element(area('Membros').getByRole('button', { name: 'Excluir' })).toBeDisabled()
    await page.getByRole('button', { name: 'Admin', exact: true }).click()
    await expect
      .element(area('Membros').getByRole('button', { name: 'Editar' }))
      .toHaveAttribute('aria-pressed', 'true')
    await expect
      .element(area('Configurações').getByRole('button', { name: 'Editar' }))
      .toHaveAttribute('aria-pressed', 'false')
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('opens the editor from Papéis', async () => {
    const app = await openEditor(ROLES_PATH)
    await page.getByRole('link', { name: 'Novo papel' }).click()
    await expect.poll(() => app.router.state.location.pathname).toBe(`${ROLES_PATH}/new`)
    await page.getByRole('link', { name: 'Voltar para Papéis' }).click()
    await page.getByRole('link', { name: 'Abrir Contador' }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`${ROLES_PATH}/role-accountant`)
  })

  it('says who still uses a role instead of deleting it, and leads there', async () => {
    const app = await openEditor(`${ROLES_PATH}/role-accountant`, invitationsAnswer())
    await page.getByRole('button', { name: 'Excluir papel' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Não dá para excluir Contador' })
    await expect
      .element(dialog.getByText(/Um convite pendente usa este papel \(member\.c@exemplo\.com\)/))
      .toBeVisible()
    await dialog.getByRole('button', { name: 'Ver convites' }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/members/invitations`)
  })

  it('deletes a role nobody uses after confirming', async () => {
    let deleted = false
    const app = await openEditor(`${ROLES_PATH}/role-accountant`, {
      ...invitationsAnswer([]),
      [`DELETE ${BASE}/roles/role-accountant`]: () => {
        deleted = true
        return new Response(null, { status: NO_CONTENT })
      },
    })
    await page.getByRole('button', { name: 'Excluir papel' }).click()
    await page
      .getByRole('alertdialog', { name: 'Excluir Contador?' })
      .getByRole('button', { name: 'Excluir papel' })
      .click()

    await expect.element(page.getByText('Papel Contador excluído.')).toBeVisible()
    await expect.poll(() => app.router.state.location.pathname).toBe(ROLES_PATH)
    expect(deleted).toBe(true)
  })

  it('never offers to delete a system role', async () => {
    await openEditor(`${ROLES_PATH}/role-admin`)
    await expect.element(page.getByRole('heading', { name: 'Admin', level: 1 })).toBeVisible()
    expect(page.getByRole('button', { name: 'Excluir papel' }).query()).toBeNull()
  })

  it('edits a role in two columns on the desktop, with who uses it', async () => {
    await page.viewport(1440, 1000)
    const sent: unknown[] = []
    await openEditor(`${ROLES_PATH}/role-accountant`, {
      ...invitationsAnswer(),
      [`PATCH ${BASE}/roles/role-accountant`]: async (request) => {
        sent.push(await request.json())
        return new Response(null, { status: NO_CONTENT })
      },
    })
    await expect.element(page.getByRole('link', { name: 'Papéis' })).toBeVisible()
    await expect.element(page.getByText('Papel do espaço · ninguém usa ainda')).toBeVisible()
    await page.getByRole('button', { name: 'Ações do papel Contador' }).click()
    await expect.element(page.getByRole('menuitem', { name: 'Excluir papel' })).toBeVisible()
    await userEvent.keyboard('{Escape}')
    const usage = page.getByRole('region', { name: 'Quem usa' })
    await expect.element(usage.getByText('member.c@exemplo.com')).toBeVisible()
    const permissions = page.getByRole('table', { name: 'Permissões' })
    await expect
      .element(permissions.getByRole('checkbox', { name: 'Excluir em Membros' }))
      .toBeChecked()
    await permissions.getByRole('checkbox', { name: 'Ver em Lançamentos' }).click()
    await page.getByRole('button', { name: 'Salvar papel' }).click()

    await expect.element(page.getByText('Papel Contador salvo.')).toBeVisible()
    expect(sent).toEqual([
      {
        name: 'Contador',
        description: 'Vê tudo e anexa comprovantes. Não muda valores.',
        permissions: [
          { module: 'members', action: 'delete' },
          { module: 'entries', action: 'view' },
        ],
      },
    ])
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })
})

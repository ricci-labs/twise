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
import {
  ADMIN_HOUSEHOLD,
  invitationsAnswer,
  membersAnswer,
  rolesAnswer,
} from '@web/testing/members-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const INVITATIONS_PATH = `/w/${WORKSPACE_ID}/members/invitations`
const CREATED = 201
const CONFLICT = 409
const LINK = 'https://app.exemplo.com/invite#token=abc123'

async function openInvite(
  answers: Record<string, FakeAnswer> = {},
  access: FakeAnswer = workspaceAccess,
  path = `${INVITATIONS_PATH}/new`,
) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...membersAnswer(),
    ...rolesAnswer(),
    ...invitationsAnswer([]),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
  await render(<AppProviders app={app} />)
  return app
}

function recordInvites(sent: unknown[], shareableLink: string | null): Record<string, FakeAnswer> {
  return {
    [`POST ${BASE}/invitations`]: async (request) => {
      sent.push(await request.json())
      return Response.json(
        { invitationId: 'invitation-x', expiresAt: '2026-10-27T12:00:00.000Z', shareableLink },
        { status: CREATED },
      )
    },
  }
}

describe('MEM-03 Convidar', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('invites by e-mail as Membro by default and goes back to Convites', async () => {
    const sent: unknown[] = []
    const app = await openInvite(
      recordInvites(sent, null),
      workspaceAccess,
      `/w/${WORKSPACE_ID}/members`,
    )
    await page.getByRole('link', { name: 'Convidar' }).click()
    await expect.poll(() => app.router.state.location.pathname).toBe(`${INVITATIONS_PATH}/new`)
    expect(page.getByRole('navigation', { name: 'Navegação', exact: true }).query()).toBeNull()
    await expect
      .element(page.getByRole('button', { name: /^Papel/ }))
      .toHaveTextContent('MembroLança, edita e planeja. Só vê contas, orçamentos e configurações.')
    await expect
      .element(page.getByText('O convite vale por 7 dias. Você pode revogar antes.'))
      .toBeVisible()
    await userEvent.fill(page.getByRole('textbox', { name: 'E-mail' }), 'member.c@exemplo.com')
    await page.getByRole('button', { name: 'Enviar convite' }).click()

    await expect
      .element(
        page.getByText(
          'Convite enviado para member.c@exemplo.com. Ele vale por 7 dias e só esse e-mail pode aceitar.',
        ),
      )
      .toBeVisible()
    await expect.poll(() => app.router.state.location.pathname).toBe(INVITATIONS_PATH)
    expect(sent).toEqual([{ email: 'member.c@exemplo.com', roleId: 'role-member' }])
  })

  it('shows the phone invitation link once, to send by WhatsApp or copy', async () => {
    const sent: unknown[] = []
    const app = await openInvite(recordInvites(sent, LINK))
    await page.getByRole('button', { name: 'Telefone' }).click()
    await userEvent.fill(page.getByRole('textbox', { name: /Telefone/ }), '11999990005')
    await page.getByRole('button', { name: 'Enviar convite' }).click()

    const sheet = page.getByRole('dialog', { name: 'Convite pronto' })
    await expect
      .element(
        sheet.getByText('Convite criado para +55 (11) 99999-0005, como Membro. Vale até 27/10.'),
      )
      .toBeVisible()
    await expect.element(sheet.getByText(/Este link aparece só agora\./)).toBeVisible()
    await expect.element(sheet.getByText(LINK)).toBeVisible()
    await expect
      .element(sheet.getByRole('link', { name: 'Enviar pelo WhatsApp' }))
      .toHaveAttribute('href', expect.stringContaining('https://wa.me/5511999990005'))
    expect(sent).toEqual([{ phoneE164: '+5511999990005', roleId: 'role-member' }])
    await expectNoAccessibilityViolations(sheet.element())
    await sheet.getByRole('button', { name: 'Fechar' }).click()
    await expect.poll(() => app.router.state.location.pathname).toBe(INVITATIONS_PATH)
  })

  it('puts an already pending invitation under the contact field', async () => {
    await openInvite({
      [`POST ${BASE}/invitations`]: () => apiError('INVITATION_PENDING', CONFLICT),
    })
    await userEvent.fill(page.getByRole('textbox', { name: 'E-mail' }), 'member.c@exemplo.com')
    await page.getByRole('button', { name: 'Enviar convite' }).click()

    await expect.element(page.getByText(/Já existe um convite pendente/)).toBeVisible()
  })

  it('offers an admin only the roles they may give', async () => {
    const adminPermissions = [
      ...VIEWER_PERMISSIONS,
      { module: 'settings', action: 'view' },
      { module: 'members', action: 'view' },
      { module: 'members', action: 'create' },
      { module: 'members', action: 'update' },
    ]
    await openInvite({ ...membersAnswer(ADMIN_HOUSEHOLD) }, () =>
      accessAs('Admin', adminPermissions),
    )
    await page.getByRole('button', { name: /^Papel/ }).click()
    const sheet = page.getByRole('dialog', { name: 'Papel' })
    await expect.element(sheet.getByRole('button', { name: /Dono/ })).toBeDisabled()
    await expect.element(sheet.getByRole('button', { name: /Contador/ })).toBeDisabled()
    await expect.element(sheet.getByRole('button', { name: /Membro/ })).toBeEnabled()
  })

  it('opens as a dialog over Membros on the desktop', async () => {
    await page.viewport(1440, 900)
    const sent: unknown[] = []
    const app = await openInvite(recordInvites(sent, null))
    const dialog = page.getByRole('dialog', { name: 'Convidar para o espaço Casa' })
    await expect.element(dialog).toBeVisible()
    await expect
      .poll(() => document.body.textContent)
      .toContain('Quem participa do espaço Casa e o que cada um pode fazer.')
    await userEvent.fill(dialog.getByRole('textbox', { name: 'E-mail' }), 'member.c@exemplo.com')
    await dialog.getByRole('button', { name: 'Enviar convite' }).click()

    await expect.poll(() => app.router.state.location.pathname).toBe(INVITATIONS_PATH)
    expect(sent).toEqual([{ email: 'member.c@exemplo.com', roleId: 'role-member' }])
  })

  it('closes the dialog back to Membros on "Cancelar"', async () => {
    await page.viewport(1440, 900)
    const app = await openInvite()
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click()
    await expect.poll(() => app.router.state.location.pathname).toBe(`/w/${WORKSPACE_ID}/members`)
  })
})

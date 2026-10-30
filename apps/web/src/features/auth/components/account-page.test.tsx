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
import { fieldLabelled } from '@web/testing/fields'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const ACCOUNT_PATH = `/w/${WORKSPACE_ID}/account`
const NO_CONTENT = 204
const UNAUTHORIZED = 401
const BAD_REQUEST = 400
const TOO_MANY = 429

async function openAccount(path = ACCOUNT_PATH, answers: Record<string, FakeAnswer> = {}) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
  await render(<AppProviders app={app} />)
  return app
}

describe('ME-01 Minha conta', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('shows who you are, the name to change and the e-mail locked', async () => {
    await openAccount()
    await expect.element(page.getByRole('heading', { name: 'Minha conta', level: 1 })).toBeVisible()
    await expect.element(page.getByRole('heading', { name: 'Member A', level: 2 })).toBeVisible()
    const you = page.getByRole('region', { name: 'Você' })
    await expect.element(you.getByRole('link', { name: /Nome/ })).toBeVisible()
    await expect
      .element(you.getByText('member.a@exemplo.com · Não muda por enquanto'))
      .toBeVisible()
    expect(you.getByRole('link', { name: /E-mail/ }).query()).toBeNull()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('logs out from "Sair" without asking', async () => {
    let isLoggedOut = false
    const app = await openAccount(ACCOUNT_PATH, {
      'GET /api/auth/me': () =>
        isLoggedOut ? apiError('SESSION_REQUIRED', UNAUTHORIZED) : account(),
      'POST /api/auth/logout': () => {
        isLoggedOut = true
        return new Response(null, { status: NO_CONTENT })
      },
    })
    await page.getByRole('button', { name: 'Sair' }).click()
    await expect.poll(() => app.router.state.location.pathname).toBe('/login')
  })

  it('changes the name on its own screen', async () => {
    const sent: unknown[] = []
    await openAccount(`${ACCOUNT_PATH}/name`, {
      'PATCH /api/auth/me': async (request) => {
        sent.push(await request.json())
        return new Response(null, { status: NO_CONTENT })
      },
    })
    await expect.element(page.getByRole('heading', { name: 'Nome', level: 1 })).toBeVisible()
    expect(page.getByRole('navigation', { name: 'Navegação', exact: true }).query()).toBeNull()
    await expect.element(page.getByRole('button', { name: 'Salvar nome' })).toBeDisabled()
    await userEvent.fill(page.getByRole('textbox', { name: 'Nome' }), 'Member Alpha')
    await page.getByRole('button', { name: 'Salvar nome' }).click()

    await expect.element(page.getByText('Nome atualizado.')).toBeVisible()
    expect(sent).toEqual([{ displayName: 'Member Alpha' }])
  })

  it('changes the password and says the other devices were logged out', async () => {
    const sent: unknown[] = []
    await openAccount(`${ACCOUNT_PATH}/password`, {
      'POST /api/auth/password/change': async (request) => {
        sent.push(await request.json())
        return new Response(null, { status: NO_CONTENT })
      },
    })
    await expect
      .element(page.getByRole('heading', { name: 'Trocar senha', level: 1 }))
      .toBeVisible()
    await fieldLabelled('Senha atual').fill('senha antiga certa')
    await fieldLabelled('Nova senha').fill('uma frase bem nova')
    await fieldLabelled('Repita a nova senha').fill('uma frase bem nova')
    await page.getByRole('button', { name: 'Trocar senha' }).click()

    await expect
      .element(page.getByText('Senha trocada. Saímos dos outros aparelhos.'))
      .toBeVisible()
    expect(sent).toEqual([
      { currentPassword: 'senha antiga certa', newPassword: 'uma frase bem nova' },
    ])
  })

  it('puts a wrong current password under its field and a different repeat under its own', async () => {
    await openAccount(`${ACCOUNT_PATH}/password`, {
      'POST /api/auth/password/change': () => apiError('CURRENT_PASSWORD_WRONG', BAD_REQUEST),
    })
    await expect
      .element(page.getByRole('heading', { name: 'Trocar senha', level: 1 }))
      .toBeVisible()
    await fieldLabelled('Senha atual').fill('senha errada')
    await fieldLabelled('Nova senha').fill('uma frase bem nova')
    await fieldLabelled('Repita a nova senha').fill('outra frase qualquer')
    await userEvent.tab()
    await expect.element(page.getByText('As senhas não são iguais.')).toBeVisible()

    await fieldLabelled('Repita a nova senha').fill('uma frase bem nova')
    await page.getByRole('button', { name: 'Trocar senha' }).click()
    await expect.element(page.getByText('A senha atual está incorreta.')).toBeVisible()
  })

  it('waits with a countdown after too many wrong attempts', async () => {
    await openAccount(`${ACCOUNT_PATH}/password`, {
      'POST /api/auth/password/change': () =>
        apiError('TOO_MANY_ATTEMPTS', TOO_MANY, { 'Retry-After': '600' }),
    })
    await expect
      .element(page.getByRole('heading', { name: 'Trocar senha', level: 1 }))
      .toBeVisible()
    await fieldLabelled('Senha atual').fill('senha errada')
    await fieldLabelled('Nova senha').fill('uma frase bem nova')
    await fieldLabelled('Repita a nova senha').fill('uma frase bem nova')
    await page.getByRole('button', { name: 'Trocar senha' }).click()

    await expect.element(page.getByRole('button', { name: /Tente de novo em/ })).toBeVisible()
  })
})

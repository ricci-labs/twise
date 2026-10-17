import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { MEMBER_A } from '@web/testing/accounts-api'
import { CONTACT_BALANCES, CONTACT_D, CONTACT_F, contactsAnswers } from '@web/testing/contacts-api'
import {
  accessAs,
  apiError,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const FORBIDDEN = 403
const MEMBER_NAME = /Member [A-Z]/

async function openContacts({
  access = workspaceAccess,
  answers = {},
  search = '',
}: {
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
  search?: string
} = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...contactsAnswers(answers),
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/contacts${search}`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

function rowNames(): string[] {
  const list = page.getByRole('list', { name: 'Contatos', exact: true }).element()
  return [...list.querySelectorAll('[data-slot=contact-row]')].map(
    (row) => row.textContent?.match(MEMBER_NAME)?.[0] ?? '',
  )
}

describe('CON-01 contacts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds up what they owe and lists the most overdue first, the archived folded', async () => {
    await openContacts()

    await expect.element(page.getByRole('heading', { name: 'Contatos', level: 1 })).toBeVisible()
    await expect.element(page.getByText('R$ 840,00')).toBeVisible()
    await expect.element(page.getByText('de 3 contatos')).toBeVisible()
    await expect.element(page.getByText('1 contato · desde 10/10')).toBeVisible()
    await expect.element(page.getByText(/200,00 vencido desde 10\/10/)).toBeVisible()
    await expect.element(page.getByText(/Próximo: R\$\s120,00 em 25\/10/)).toBeVisible()
    await expect.element(page.getByText('Não quer mensagens')).toBeVisible()
    await expect.element(page.getByText(/Tem crédito de R\$\s30,00/)).toBeVisible()
    expect(rowNames()).toEqual(['Member D', 'Member C', 'Member E', 'Member F'])
    await expect.element(page.getByRole('radio', { name: 'Mais atrasados primeiro' })).toBeChecked()
    await expect.element(page.getByText('Member G')).not.toBeInTheDocument()

    await page.getByRole('button', { name: 'Arquivados (1)' }).click()

    await expect.element(page.getByText('Member G')).toBeVisible()
  })

  it('sorts by name and keeps the order in the address', async () => {
    const app = await openContacts()

    await page.getByRole('radio', { name: 'Nome' }).click()

    await expect.poll(() => app.router.state.location.search).toEqual({ sort: 'name' })
    await expect.poll(rowNames).toEqual(['Member C', 'Member D', 'Member E', 'Member F'])
  })

  it('opens the contact from its row and charges from the pill', async () => {
    const app = await openContacts()

    await page.getByRole('link', { name: /^Member F/ }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/contacts/${CONTACT_F}`)

    app.router.history.back()
    await page.getByRole('button', { name: 'Cobrar Member D' }).click()

    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/contacts/${CONTACT_D}`)
    expect(app.router.state.location.search).toEqual({ charge: 'new' })
  })

  it('says when what is due is already charged, without "Cobrar"', async () => {
    const charged = CONTACT_BALANCES.map((balance) =>
      balance.contactId === CONTACT_D
        ? {
            ...balance,
            dueNotChargedCents: 0,
            lastCharge: { chargeId: CONTACT_D, createdOn: '2026-10-20', status: 'sent' },
          }
        : balance,
    )
    await openContacts({
      answers: { [`GET ${BASE}/contacts/balances`]: () => Response.json(charged) },
    })

    await expect.element(page.getByText('Cobrado em 20/10')).toBeVisible()
    await expect.element(page.getByText('Em atraso', { exact: true })).toBeVisible()
    await expect.element(page.getByRole('button', { name: /^Cobrar/ })).not.toBeInTheDocument()
  })

  it('offers "Novo contato" to members who can create', async () => {
    const app = await openContacts()

    await page.getByRole('link', { name: 'Novo contato' }).click()

    await expect.poll(() => app.router.state.location.search).toEqual({ contact: 'new' })
  })

  it('leaves viewers without "Novo contato" and without "Cobrar"', async () => {
    await openContacts({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByText('Member D')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Novo contato' })).not.toBeInTheDocument()
    await expect.element(page.getByRole('button', { name: /^Cobrar/ })).not.toBeInTheDocument()
  })

  it('explains what a contact is when there is none yet', async () => {
    await openContacts({
      answers: {
        [`GET ${BASE}/contacts`]: () => Response.json([]),
        [`GET ${BASE}/contacts/balances`]: () => Response.json([]),
      },
    })

    await expect.element(page.getByText('Nenhum contato ainda.')).toBeVisible()
    await expect.element(page.getByText(/um amigo no jantar/)).toBeVisible()
    expect(page.getByRole('link', { name: 'Novo contato' }).elements()).toHaveLength(2)
    await expect.element(page.getByText('Total a receber')).not.toBeInTheDocument()
  })

  it('draws the skeleton while loading', async () => {
    await openContacts({ answers: { [`GET ${BASE}/contacts`]: () => new Promise(() => {}) } })

    await expect.element(page.getByText('Carregando…').first()).toBeInTheDocument()
    expect(document.querySelector('[data-slot=list-skeleton]')).not.toBeNull()
    await expect.element(page.getByText('Total a receber')).not.toBeInTheDocument()
  })

  it('says it could not load, with the code, and tries again', async () => {
    let attempts = 0
    await openContacts({
      answers: {
        [`GET ${BASE}/contacts/balances`]: () => {
          attempts += 1
          return attempts === 1 ? apiError('ACCESS_DENIED', FORBIDDEN) : Response.json([])
        },
      },
    })

    await expect.element(page.getByText('Não foi possível carregar os contatos.')).toBeVisible()
    await expect.element(page.getByText('Código: abcd1234')).toBeVisible()
    await page.getByRole('button', { name: 'Tentar de novo' }).click()

    await expect.element(page.getByText('Member D')).toBeVisible()
  })

  it('has no accessibility violations', async () => {
    await openContacts()
    await expect.element(page.getByText('Member D')).toBeVisible()

    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })
})

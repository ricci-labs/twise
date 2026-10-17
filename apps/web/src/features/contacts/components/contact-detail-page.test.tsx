import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { MEMBER_A } from '@web/testing/accounts-api'
import {
  CHARGE_SENT,
  CONTACT_C,
  CONTACT_D,
  CONTACT_D_OPEN_ITEMS,
  CONTACT_F,
  CONTACT_G,
  contactAnswers,
} from '@web/testing/contacts-api'
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const NOT_FOUND = 404
const FORBIDDEN = 403

async function openContact({
  contactId = CONTACT_D,
  access = workspaceAccess,
  answers = {},
}: {
  contactId?: string
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
} = {}) {
  const fetchSpy = fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...contactAnswers(contactId, answers),
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/contacts/${contactId}`] }),
  )
  await render(<AppProviders app={app} />)
  return { app, fetchSpy }
}

describe('CON-02 contact detail', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T15:00:00.000Z'))
    await page.viewport(390, 844)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows what the contact owes, split into overdue and to come, and how to reach them', async () => {
    const { fetchSpy } = await openContact()

    await expect.element(page.getByRole('heading', { name: 'Member D' })).toBeVisible()
    await expect.element(page.getByText('R$ 520,00').first()).toBeVisible()
    await expect.element(page.getByText('desde 10/10')).toBeVisible()
    await expect.element(page.getByText('em 10/11')).toBeVisible()
    await expect.element(page.getByRole('heading', { name: 'Vencidos' })).toBeVisible()
    await expect.element(page.getByRole('heading', { name: 'A vencer' })).toBeVisible()
    await expect.element(page.getByText('Mercado da semana')).toBeVisible()
    await expect.element(page.getByText('Parcela 2/3')).toBeVisible()
    await expect.element(page.getByText('+55 (11) 99999-0004')).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Abrir o WhatsApp de Member D' }))
      .toHaveAttribute('href', 'https://wa.me/5511999990004')
    await expect.element(page.getByText('Chave Pix de Member D')).toBeVisible()
    await expect.element(page.getByText('Divide a TV da sala e o mercado do mês.')).toBeVisible()
    const openItemsCall = fetchSpy.mock.calls
      .map(
        ([input]) => new URL(String(input instanceof Request ? input.url : input), location.href),
      )
      .find((url) => url.pathname.endsWith('/open-items'))
    expect(openItemsCall?.searchParams.get('includeCharged')).toBe('true')
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('says which overdue items are already in a charge instead of calling them late', async () => {
    const [first, ...rest] = CONTACT_D_OPEN_ITEMS
    await openContact({
      answers: {
        [`GET ${BASE}/contacts/${CONTACT_D}/open-items`]: () =>
          Response.json([
            { ...first, inChargeId: CONTACT_C, inChargeCreatedOn: '2026-10-20' },
            ...rest,
          ]),
      },
    })

    await expect.element(page.getByText('Na cobrança de 20/10')).toBeVisible()
    await expect.element(page.getByText('Atrasado')).toBeVisible()
  })

  it('opens the new charge and the receipt with the contact chosen', async () => {
    const { app } = await openContact()

    await page.getByRole('button', { name: 'Nova cobrança' }).click()
    await expect.poll(() => app.router.state.location.search).toMatchObject({ charge: 'new' })
    const newCharge = page.getByRole('dialog', { name: 'Nova cobrança' })
    await expect.element(newCharge).toBeVisible()
    await newCharge.getByRole('button', { name: 'Cancelar' }).last().click()
    await expect.element(newCharge).not.toBeInTheDocument()

    await page.getByRole('link', { name: 'Recebeu sem cobrança? Registrar recebimento' }).click()
    await expect
      .poll(() => app.router.state.location.search)
      .toMatchObject({
        entry: 'new',
        entryType: 'settlement',
        entryContact: CONTACT_D,
      })
  })

  it('shows credit without the charge, the tiles or the open items', async () => {
    await openContact({ contactId: CONTACT_F })

    await expect.element(page.getByText('Crédito de')).toBeVisible()
    await expect.element(page.getByText('Nada em aberto com este contato.')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Nova cobrança' }))
      .not.toBeInTheDocument()
    await expect.element(page.getByText('Em atraso')).not.toBeInTheDocument()
  })

  it('lets a viewer read and reach the contact but not charge or record', async () => {
    await openContact({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByText('Mercado da semana')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Nova cobrança' }))
      .not.toBeInTheDocument()
    await expect
      .element(page.getByRole('link', { name: 'Recebeu sem cobrança? Registrar recebimento' }))
      .not.toBeInTheDocument()
    await expect.element(page.getByRole('button', { name: 'Copiar chave Pix' })).toBeVisible()
  })

  it('says the contact is gone', async () => {
    await openContact({
      answers: {
        [`GET ${BASE}/contacts/${CONTACT_D}`]: () => apiError('CONTACT_NOT_FOUND', NOT_FOUND),
      },
    })
    await expect.element(page.getByText('Este contato não existe mais.')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Ver contatos' })).toBeVisible()
  })

  it('offers a retry when loading fails', async () => {
    let attempts = 0
    await openContact({
      answers: {
        [`GET ${BASE}/contacts/${CONTACT_D}/open-items`]: () => {
          attempts += 1
          return attempts === 1
            ? apiError('ACCESS_DENIED', FORBIDDEN)
            : Response.json(CONTACT_D_OPEN_ITEMS)
        },
      },
    })
    await expect.element(page.getByText('Não foi possível carregar o contato.')).toBeVisible()
    await page.getByRole('button', { name: 'Tentar de novo' }).click()
    await expect.element(page.getByText('Mercado da semana')).toBeVisible()
  })

  it('opens a charge in place with its items, message and copy actions', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    await openContact()

    await expect.element(page.getByRole('button', { name: /Cobrança de 20\/10/ })).toBeVisible()
    await expect.element(page.getByText('Paga', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: /Cobrança de 20\/10/ }).click()

    await expect.element(page.getByText('Total · venceu em 10/10')).toBeVisible()
    await expect.element(page.getByText(/Enviada por e-mail em 20\/10/)).toBeVisible()
    await page.getByRole('button', { name: 'Copiar Pix' }).click()
    await expect.element(page.getByText('Pix copiado.')).toBeVisible()
    expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining('br.gov.bcb.pix'))
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('cancels an unpaid charge after asking', async () => {
    let cancelled = ''
    await openContact({
      answers: {
        [`POST ${BASE}/charges/${CHARGE_SENT}/cancel`]: () => {
          cancelled = CHARGE_SENT
          return new Response(null, { status: 204 })
        },
      },
    })
    await page.getByRole('button', { name: /Cobrança de 20\/10/ }).click()
    await page.getByRole('button', { name: 'Ações da cobrança de 20/10' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar cobrança' }).click()
    const confirm = page.getByRole('alertdialog', { name: 'Cancelar esta cobrança?' })
    await expect.element(confirm).toBeVisible()
    await confirm.getByRole('button', { name: 'Cancelar cobrança' }).click()

    await expect.element(page.getByText('Cobrança cancelada.')).toBeVisible()
    expect(cancelled).toBe(CHARGE_SENT)
  })

  it('offers no cancel on a paid charge, and only copying to a viewer', async () => {
    await openContact()
    await page.getByRole('button', { name: /Cobrança de 12\/09/ }).click()
    await expect.element(page.getByText(/R\$\s160,00 recebidos em 15\/09 na Conta X/)).toBeVisible()
    await page.getByRole('button', { name: 'Ações da cobrança de 12/09' }).click()
    const sheet = page.getByRole('dialog')
    await expect.element(sheet.getByRole('button', { name: 'Copiar mensagem' })).toBeVisible()
    await expect
      .element(sheet.getByRole('button', { name: 'Cancelar cobrança' }))
      .not.toBeInTheDocument()
  })

  it('lets a viewer copy a charge but not act on it', async () => {
    await openContact({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })
    await page.getByRole('button', { name: /Cobrança de 20\/10/ }).click()

    await expect.element(page.getByRole('button', { name: 'Copiar mensagem' })).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Ações da cobrança de 20/10' }))
      .not.toBeInTheDocument()
  })

  it('opens the edit form from the pencil and from the actions', async () => {
    const { app } = await openContact()

    await page.getByRole('link', { name: 'Editar contato' }).click()
    await expect.poll(() => app.router.state.location.search).toMatchObject({ contact: CONTACT_D })
    await expect.element(page.getByRole('textbox', { name: 'Nome' })).toHaveValue('Member D')
  })

  it('marks the contact as not wanting messages from the actions', async () => {
    let change: unknown = null
    await openContact({
      answers: {
        [`PATCH ${BASE}/contacts/${CONTACT_D}`]: async (request) => {
          change = await request.json()
          return new Response(null, { status: 204 })
        },
      },
    })
    await page.getByRole('button', { name: 'Ações de Member D' }).click()
    await page
      .getByRole('dialog')
      .getByRole('switch', { name: /Não quer receber mensagens/ })
      .click()

    await expect.element(page.getByText('Marcado: não quer receber mensagens.')).toBeVisible()
    expect(change).toEqual({ isOptedOut: true })
  })

  it('explains why a contact who owes cannot be archived and offers the charge', async () => {
    const { app } = await openContact()
    await page.getByRole('button', { name: 'Ações de Member D' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Arquivar' }).click()

    const blocked = page.getByRole('alertdialog', { name: 'Não dá para arquivar Member D' })
    await expect.element(blocked.getByText(/Member D ainda deve R\$\s520,00\./)).toBeVisible()
    await blocked.getByRole('button', { name: 'Nova cobrança' }).click()
    await expect.poll(() => app.router.state.location.search).toMatchObject({ charge: 'new' })
  })

  it('unarchives an archived contact', async () => {
    let change: unknown = null
    await openContact({
      contactId: CONTACT_G,
      answers: {
        [`PATCH ${BASE}/contacts/${CONTACT_G}`]: async (request) => {
          change = await request.json()
          return new Response(null, { status: 204 })
        },
      },
    })
    await page.getByRole('button', { name: 'Ações de Member G' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Desarquivar' }).click()

    await expect.element(page.getByText('Contato desarquivado.')).toBeVisible()
    expect(change).toEqual({ isArchived: false })
  })

  it('warns before deleting a contact who owes and goes back to the list', async () => {
    let deleted = false
    const { app } = await openContact({
      answers: {
        [`DELETE ${BASE}/contacts/${CONTACT_D}`]: () => {
          deleted = true
          return new Response(null, { status: 204 })
        },
      },
    })
    await page.getByRole('button', { name: 'Ações de Member D' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click()

    const confirm = page.getByRole('alertdialog', { name: 'Excluir Member D?' })
    await expect.element(confirm.getByText(/não apaga as dívidas dos lançamentos/)).toBeVisible()
    await confirm.getByRole('button', { name: 'Excluir' }).click()

    await expect.poll(() => app.router.state.location.pathname).toBe(`/w/${WORKSPACE_ID}/contacts`)
    expect(deleted).toBe(true)
  })

  it('gives a viewer no pencil and no actions', async () => {
    await openContact({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByText('Mercado da semana')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Editar contato' })).not.toBeInTheDocument()
    await expect
      .element(page.getByRole('button', { name: 'Ações de Member D' }))
      .not.toBeInTheDocument()
  })
})

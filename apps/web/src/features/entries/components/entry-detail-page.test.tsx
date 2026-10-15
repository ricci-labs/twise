import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accountsAnswers,
  CARD,
  CHECKING,
  FUTURE_INVOICE,
  GROCERIES,
  MEMBER_A,
  OPEN_INVOICE,
  PAID_INVOICE,
  SAVINGS,
} from '@web/testing/accounts-api'
import { entriesListAnswers, listedEntry } from '@web/testing/entries-api'
import {
  accessAs,
  apiError,
  fakeApi,
  MEMBER_A_ID,
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
const ENTRY_ID = '00000000-0000-4000-8000-000000000301'
const CONTACT_C = '00000000-0000-4000-8000-0000000000d1'

const INSTALLMENTS = listedEntry(
  ENTRY_ID,
  '2026-09-20',
  'Geladeira',
  'card_purchase',
  [
    [GROCERIES, 300000],
    [CARD, -100000, { invoiceId: PAID_INVOICE, installmentNo: 1 }],
    [CARD, -100000, { invoiceId: OPEN_INVOICE, installmentNo: 2 }],
    [CARD, -100000, { invoiceId: FUTURE_INVOICE, installmentNo: 3 }],
  ],
  { installmentCount: 3, paymentMethod: 'credit', notes: 'Para a cozinha nova.' },
)

const DINNER = {
  ...listedEntry(ENTRY_ID, '2026-10-19', 'Jantar de aniversário', 'card_purchase', [
    [GROCERIES, 16000],
    ['receivable', 8000, { contactId: CONTACT_C }],
    [CARD, -24000, { invoiceId: OPEN_INVOICE, installmentNo: 1 }],
  ]),
  shares: [{ contactId: CONTACT_C, amountCents: 8000 }],
  ownCents: 16000,
}

const TRANSFER = listedEntry(
  ENTRY_ID,
  '2026-10-10',
  'Reserva de emergência',
  'transfer',
  [
    [CHECKING, -60000],
    [SAVINGS, 60000],
  ],
  { spentByUserId: null, paymentMethod: 'pix' },
)

async function openDetail(
  entry: unknown,
  { access = workspaceAccess, answers = {} as Record<string, FakeAnswer> } = {},
) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...accountsAnswers(),
    ...entriesListAnswers(),
    [`GET ${BASE}/entries/${ENTRY_ID}`]: () => Response.json(entry),
    [`GET ${BASE}/contacts`]: () =>
      Response.json([
        {
          id: CONTACT_C,
          name: 'Member C',
          phoneE164: null,
          pixKey: null,
          notes: null,
          isOptedOut: false,
          isArchived: false,
        },
      ]),
    [`GET ${BASE}/occurrences/matched`]: () => Response.json(null),
    ...answers,
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/entries/${ENTRY_ID}`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

describe('ENT-03 entry detail', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T15:00:00.000Z'))
    await page.viewport(390, 844)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a purchase in installments with its invoices and the closed-invoice note', async () => {
    const app = await openDetail(INSTALLMENTS)

    await expect.element(page.getByRole('heading', { name: 'Geladeira' })).toBeVisible()
    await expect
      .element(page.getByText(/^Parte deste lançamento está em uma fatura fechada/))
      .toBeVisible()
    const installments = page.getByRole('region', { name: 'Parcelas' })
    await expect.element(installments.getByText('1/3')).toBeVisible()
    await expect.element(installments.getByText('Paga')).toBeVisible()
    await expect.element(installments.getByText('Aberta')).toBeVisible()
    await expect.element(page.getByText('Para a cozinha nova.')).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Histórico deste lançamento' }))
      .toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())

    await installments.getByRole('link', { name: /2\/3/ }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/cards/${CARD}/invoices/${OPEN_INVOICE}`)
  })

  it('shows what each contact owes and the own part, with the invoice of a purchase in one go', async () => {
    await openDetail(DINNER)

    const shares = page.getByRole('region', { name: 'Dividido com contatos' })
    await expect.element(shares.getByText(/Member C/)).toBeVisible()
    await expect.element(shares.getByText('Sua parte')).toBeVisible()
    await expect.element(shares.getByRole('link', { name: 'Ver cobranças' })).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'novembro, vence 04/11' })).toBeVisible()
    await expect.element(page.getByText(/^Parte deste lançamento/)).not.toBeInTheDocument()
  })

  it('draws a transfer from one account to the other, and the bill it paid', async () => {
    await openDetail(TRANSFER, {
      answers: {
        [`GET ${BASE}/occurrences/matched`]: () =>
          Response.json({ description: 'Aluguel', dueOn: '2026-10-10' }),
      },
    })

    const flow = page.getByRole('region', { name: 'De onde para onde' })
    await expect.element(flow.getByText('Saiu de')).toBeVisible()
    await expect.element(flow.getByText('Poupança')).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Pagou a conta prevista Aluguel de outubro' }))
      .toBeVisible()
    await expect.element(page.getByText('Member A, pela web')).toBeVisible()
  })

  it('says the entry is gone and leads back to the list', async () => {
    const app = await openDetail(null, {
      answers: { [`GET ${BASE}/entries/${ENTRY_ID}`]: () => apiError('ENTRY_NOT_FOUND', 404) },
    })

    await expect.element(page.getByText('Este lançamento foi excluído ou editado.')).toBeVisible()
    await page.getByRole('link', { name: 'Voltar para Lançamentos' }).last().click()
    await expect.poll(() => app.router.state.location.pathname).toBe(`/w/${WORKSPACE_ID}/entries`)
  })

  it('shows a viewer the entry to read, without attaching or the history', async () => {
    await openDetail(TRANSFER, { access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByRole('heading', { name: 'Reserva de emergência' })).toBeVisible()
    await expect.element(page.getByText('Nenhum comprovante.')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: /Anexar comprovante/ }))
      .not.toBeInTheDocument()
    await expect
      .element(page.getByRole('link', { name: 'Histórico deste lançamento' }))
      .not.toBeInTheDocument()
    expect(MEMBER_A_ID).toBe(MEMBER_A)
  })
})

describe('ENT-03 actions', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T15:00:00.000Z'))
    await page.viewport(390, 844)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function recorder(calls: string[]): FakeAnswer {
    return async (request) => {
      const body = request.method === 'DELETE' ? await request.text() : ''
      calls.push(
        `${request.method} ${new URL(request.url).pathname.replace(`${BASE}/entries/`, '')} ${body}`.trim(),
      )
      return new Response(null, { status: 204 })
    }
  }

  it('deletes with no question, back on the list, and undoes it from the toast', async () => {
    const calls: string[] = []
    const app = await openDetail(TRANSFER, {
      answers: {
        [`DELETE ${BASE}/entries/${ENTRY_ID}`]: recorder(calls),
        [`POST ${BASE}/entries/${ENTRY_ID}/restore`]: recorder(calls),
      },
    })

    await page.getByRole('button', { name: 'Ações deste lançamento' }).click()
    await page
      .getByRole('menuitem', { name: 'Excluir', exact: true })
      .or(page.getByRole('button', { name: 'Excluir', exact: true }))
      .click()

    await expect.poll(() => app.router.state.location.pathname).toBe(`/w/${WORKSPACE_ID}/entries`)
    await expect.element(page.getByText('Lançamento movido para a lixeira.')).toBeVisible()
    await page.getByRole('button', { name: 'Desfazer' }).click()
    await expect.poll(() => calls).toEqual([`DELETE ${ENTRY_ID} {}`, `POST ${ENTRY_ID}/restore`])
  })

  it('deletes with a reason that goes to the trash', async () => {
    const calls: string[] = []
    await openDetail(TRANSFER, {
      answers: { [`DELETE ${BASE}/entries/${ENTRY_ID}`]: recorder(calls) },
    })

    await page.getByRole('button', { name: 'Ações deste lançamento' }).click()
    await page.getByText('Excluir com motivo').click()
    const sheet = page.getByRole('dialog', { name: 'Excluir Reserva de emergência' })
    await sheet.getByLabelText('Motivo').fill('lançado em dobro')
    await expectNoAccessibilityViolations(sheet.element())
    await sheet.getByRole('button', { name: 'Excluir lançamento' }).click()

    await expect.poll(() => calls).toEqual([`DELETE ${ENTRY_ID} {"reason":"lançado em dobro"}`])
  })

  it('keeps only repeating and attaching for an entry on a closed invoice', async () => {
    await openDetail(INSTALLMENTS)

    await page.getByRole('button', { name: 'Ações deste lançamento' }).click()
    await expect.element(page.getByText('Repetir')).toBeVisible()
    await expect.element(page.getByText('Anexar comprovante').last()).toBeVisible()
    await expect.element(page.getByText('Excluir com motivo')).not.toBeInTheDocument()
  })

  it('repeats an entry: the new entry filled the same, dated today', async () => {
    await openDetail(DINNER)

    await page.getByRole('button', { name: 'Ações deste lançamento' }).click()
    await page.getByText('Repetir').click()

    const form = page.getByRole('dialog', { name: 'Novo lançamento' })
    await expect.element(form.getByLabelText(/^Descrição/)).toHaveValue('Jantar de aniversário')
    await expect.element(form.getByLabelText(/^Valor/)).toHaveValue('240,00')
    await expect.element(form.getByRole('radio', { name: /^Hoje/ })).toBeChecked()
  })

  it('gives a viewer no actions', async () => {
    await openDetail(TRANSFER, { access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByRole('heading', { name: 'Reserva de emergência' })).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Ações deste lançamento' }))
      .not.toBeInTheDocument()
  })
})

describe('ENT-04 edit entry', () => {
  const NEW_ID = '00000000-0000-4000-8000-000000000302'

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T15:00:00.000Z'))
    await page.viewport(390, 844)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function saved(calls: string[], answer: () => Response): FakeAnswer {
    return async (request) => {
      calls.push(`${request.method} ${await request.text()}`)
      return answer()
    }
  }

  async function openEdit(entry: unknown, answers: Record<string, FakeAnswer> = {}) {
    const app = await openDetail(entry, {
      answers: { [`GET ${BASE}/entries/suggestions`]: () => Response.json([]), ...answers },
    })
    await page.getByRole('link', { name: 'Editar' }).click()
    return { app, form: page.getByRole('dialog', { name: 'Editar lançamento' }) }
  }

  it('changes only the description in place, with no note, and goes back to the detail', async () => {
    const calls: string[] = []
    const { app, form } = await openEdit(TRANSFER, {
      [`PATCH ${BASE}/entries/${ENTRY_ID}`]: saved(
        calls,
        () => new Response(null, { status: 204 }),
      ),
    })

    const save = form.getByRole('button', { name: 'Salvar alterações' })
    await expect.element(save).toHaveAttribute('aria-disabled', 'true')
    await form.getByLabelText(/^Descrição/).fill('Reserva de outubro')
    await expect.element(form.getByText(/criamos uma nova versão/)).not.toBeInTheDocument()
    await save.click()

    await expect
      .poll(() => calls)
      .toEqual(['PATCH {"description":"Reserva de outubro","notes":null}'])
    await expect.element(page.getByText('Lançamento atualizado.')).toBeVisible()
    await expect.poll(() => app.router.state.location.search).not.toHaveProperty('edit', true)
  })

  it('names what changed, saves a new version and opens it', async () => {
    const calls: string[] = []
    const { app, form } = await openEdit(TRANSFER, {
      [`PUT ${BASE}/entries/${ENTRY_ID}`]: saved(calls, () =>
        Response.json({ entryId: NEW_ID }, { status: 201 }),
      ),
      [`GET ${BASE}/entries/${NEW_ID}`]: () =>
        Response.json({ ...TRANSFER, id: NEW_ID, amountCents: 65000 }),
    })

    await form.getByLabelText(/^Valor/).fill('650,00')
    await expect
      .element(
        form.getByText(
          'Mudou o valor, então ao salvar criamos uma nova versão do lançamento. A anterior fica no histórico.',
        ),
      )
      .toBeVisible()
    await expectNoAccessibilityViolations(form.element())
    await form.getByRole('button', { name: 'Salvar alterações' }).click()

    await expect.poll(() => calls.length).toBe(1)
    expect(JSON.parse(calls[0]?.slice('PUT '.length) ?? '{}')).toMatchObject({
      entryType: 'transfer',
      amountCents: 65000,
      fromAccountId: CHECKING,
      toAccountId: SAVINGS,
    })
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/entries/${NEW_ID}`)
  })

  it('on a closed invoice changes only the description and notes, showing what stays', async () => {
    const calls: string[] = []
    const { form } = await openEdit(INSTALLMENTS, {
      [`PATCH ${BASE}/entries/${ENTRY_ID}`]: saved(
        calls,
        () => new Response(null, { status: 204 }),
      ),
    })

    await expect.element(form.getByRole('group', { name: 'O que não muda' })).toBeVisible()
    await expect
      .element(form.getByText(/^A 1ª parcela está na fatura de outubro, que já fechou/))
      .toBeVisible()
    await expect.element(form.getByLabelText(/^Valor/)).not.toBeInTheDocument()
    await form.getByLabelText(/^Observações/).fill('Para a cozinha da casa nova.')
    await form.getByRole('button', { name: 'Salvar alterações' }).click()

    await expect
      .poll(() => calls)
      .toEqual(['PATCH {"description":"Geladeira","notes":"Para a cozinha da casa nova."}'])
  })

  it('says someone changed it first and keeps what was typed', async () => {
    const { form } = await openEdit(TRANSFER, {
      [`PATCH ${BASE}/entries/${ENTRY_ID}`]: () => apiError('ENTRY_ALREADY_DELETED', 409),
    })

    await form.getByLabelText(/^Descrição/).fill('Reserva nova')
    await form.getByRole('button', { name: 'Salvar alterações' }).click()

    await expect
      .element(form.getByText('Este lançamento foi excluído ou já foi editado por outra pessoa.'))
      .toBeVisible()
    await expect.element(form.getByRole('link', { name: 'Ver a versão atual' })).toBeVisible()
    await expect.element(form.getByLabelText(/^Descrição/)).toHaveValue('Reserva nova')
  })

  it('asks before throwing changes away', async () => {
    const { form } = await openEdit(TRANSFER)

    await form.getByLabelText(/^Descrição/).fill('Outra coisa')
    await form.getByRole('button', { name: 'Fechar' }).click()
    await expect
      .element(page.getByRole('alertdialog', { name: 'Descartar as alterações?' }))
      .toBeVisible()
  })

  it('gives a viewer no pencil', async () => {
    await openDetail(TRANSFER, { access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByRole('heading', { name: 'Reserva de emergência' })).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Editar' })).not.toBeInTheDocument()
  })
})

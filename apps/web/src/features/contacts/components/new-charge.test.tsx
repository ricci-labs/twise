import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { MEMBER_A } from '@web/testing/accounts-api'
import {
  CHARGE_SENT,
  CONTACT_D,
  CONTACT_D_CHARGE_FAILED,
  CONTACT_D_CHARGES,
  CONTACT_D_OPEN_ITEMS,
  contactAnswers,
  MONEY_ACCOUNT,
} from '@web/testing/contacts-api'
import {
  accessAs,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { workspaceSettingsAnswer } from '@web/testing/settings-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const NEW_CHARGE = '00000000-0000-4000-8000-0000000000c9'

async function openNewCharge(answers: Record<string, FakeAnswer> = {}, charge = 'new') {
  const requests: { path: string; body: unknown }[] = []
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: workspaceAccess,
    ...contactAnswers(CONTACT_D, {
      [`POST ${BASE}/contacts/${CONTACT_D}/charges`]: async (request) => {
        requests.push({ path: 'create', body: await request.json() })
        return Response.json({ chargeId: NEW_CHARGE }, { status: 201 })
      },
      [`GET ${BASE}/charges/${NEW_CHARGE}`]: () =>
        Response.json({ ...CONTACT_D_CHARGES[0], id: NEW_CHARGE, status: 'draft', sentAt: null }),
      [`POST ${BASE}/charges/${NEW_CHARGE}/send-email`]: () => {
        requests.push({ path: 'send-email', body: null })
        return new Response(null, { status: 204 })
      },
      [`POST ${BASE}/charges/${CHARGE_SENT}/send-email`]: () => {
        requests.push({ path: 'resend-email', body: null })
        return new Response(null, { status: 204 })
      },
      [`POST ${BASE}/charges/${NEW_CHARGE}/sent`]: async (request) => {
        requests.push({ path: 'sent', body: await request.json() })
        return new Response(null, { status: 204 })
      },
      ...answers,
    }),
  })
  const app = createApp(
    createMemoryHistory({
      initialEntries: [`/w/${WORKSPACE_ID}/contacts/${CONTACT_D}?charge=${charge}`],
    }),
  )
  await render(<AppProviders app={app} />)
  return { app, requests }
}

describe('CON-03 new charge', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T15:00:00.000Z'))
    await page.viewport(390, 844)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('previews what is due today and adds the next installment with its shortcut', async () => {
    await openNewCharge()
    const dialog = page.getByRole('dialog', { name: 'Nova cobrança' })

    await expect.element(dialog.getByText('Vai na cobrança · 2 itens')).toBeVisible()
    await expect.element(dialog.getByText('R$ 200,00').last()).toBeVisible()
    await dialog.getByRole('radio', { name: /Até 10\/11/ }).click()

    await expect.element(dialog.getByText('Vai na cobrança · 3 itens')).toBeVisible()
    await expect.element(dialog.getByText('R$ 360,00')).toBeVisible()
    await expectNoAccessibilityViolations(dialog.element())
  })

  it('explains that what is due is already charged and offers the next installment', async () => {
    await openNewCharge({
      [`GET ${BASE}/contacts/${CONTACT_D}/open-items`]: () =>
        Response.json(
          CONTACT_D_OPEN_ITEMS.map((item) =>
            item.effectiveOn === '2026-10-10'
              ? { ...item, inChargeId: CHARGE_SENT, inChargeCreatedOn: '2026-10-20' }
              : item,
          ),
        ),
    })
    const dialog = page.getByRole('dialog', { name: 'Nova cobrança' })

    await expect.element(dialog.getByText('Nada a cobrar até essa data.')).toBeVisible()
    await expect.element(dialog.getByRole('button', { name: 'Criar cobrança' })).toBeDisabled()
    await dialog.getByRole('button', { name: /Incluir até 10\/11/ }).click()
    await expect.element(dialog.getByText('Vai na cobrança · 1 item')).toBeVisible()
  })

  it('creates the charge, offers WhatsApp and marks it sent when the member says so', async () => {
    const opened = vi.spyOn(window, 'open').mockReturnValue(null)
    const { requests, app } = await openNewCharge()

    await page.getByRole('button', { name: 'Criar cobrança' }).click()

    const created = page.getByRole('dialog', { name: 'Cobrança criada' })
    await expect
      .element(
        created.getByText('Cobrança de R$ 200,00 criada. Fica como rascunho até ser enviada.'),
      )
      .toBeVisible()
    expect(requests[0]).toEqual({ path: 'create', body: { until: '2026-10-20' } })
    await created.getByRole('button', { name: /Enviar pelo WhatsApp/ }).click()
    expect(opened).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/wa\.me\/5511999990004\?text=Oi%2C%20Member%20D!/),
      '_blank',
      'noreferrer',
    )
    const asked = page.getByRole('alertdialog', { name: 'Você enviou a mensagem?' })
    await asked.getByRole('button', { name: 'Marcar como enviada' }).click()

    await expect.element(page.getByText('Cobrança marcada como enviada.')).toBeVisible()
    expect(requests[1]).toEqual({ path: 'sent', body: { via: 'whatsapp' } })
    await expect.poll(() => app.router.state.location.search).not.toHaveProperty('charge')
  })

  it('sends the new charge by e-mail after showing to whom and the subject', async () => {
    const { requests } = await openNewCharge()
    await page.getByRole('button', { name: 'Criar cobrança' }).click()

    await page.getByRole('button', { name: /Enviar por e-mail/ }).click()
    const sheet = page.getByRole('dialog', { name: 'Enviar por e-mail' })
    await expect.element(sheet.getByText('member.d@exemplo.com')).toBeVisible()
    await expect
      .element(sheet.getByText(/Member A te enviou uma cobrança de R\$\s200,00/))
      .toBeVisible()
    await sheet.getByRole('button', { name: 'Enviar e-mail' }).click()

    await expect.element(page.getByText('E-mail enviado para member.d@exemplo.com.')).toBeVisible()
    expect(requests.map(({ path }) => path)).toEqual(['create', 'send-email'])
  })

  it('leads to the default charge text from the created charge', async () => {
    const { app } = await openNewCharge()
    await page.getByRole('button', { name: 'Criar cobrança' }).click()

    const created = page.getByRole('dialog', { name: 'Cobrança criada' })
    await created.getByRole('link', { name: 'Mudar o texto padrão das cobranças' }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/settings/charge-text`)
  })

  it('hides the charge text link from who cannot change settings', async () => {
    const charger = [
      ...VIEWER_PERMISSIONS,
      { module: 'contacts', action: 'create' },
      { module: 'contacts', action: 'update' },
    ]
    await openNewCharge({ [`GET ${BASE}`]: () => accessAs('Membro', charger) }, CHARGE_SENT)

    const resend = page.getByRole('dialog', { name: 'Enviar cobrança' })
    await expect.element(resend.getByRole('button', { name: /Enviar pelo WhatsApp/ })).toBeVisible()
    await expect
      .element(resend.getByRole('link', { name: 'Mudar o texto padrão das cobranças' }))
      .not.toBeInTheDocument()
  })

  it('shows the e-mail as it lands before sending it', async () => {
    await openNewCharge(workspaceSettingsAnswer())
    await page.getByRole('button', { name: 'Criar cobrança' }).click()
    await page.getByRole('button', { name: /Enviar por e-mail/ }).click()

    await page.getByRole('button', { name: 'Ver o e-mail como ele chega' }).click()
    const email = page.getByRole('article', { name: 'O e-mail como ele chega' })
    await expect.element(email.getByText('Oi, Member D!')).toBeVisible()
    await expect.element(email.getByText(/^R\$\s200,00 para Member A$/)).toBeVisible()
    await expect.element(email.getByText(/^Mercado da semana/)).toBeVisible()
    await expect.element(email.getByText('venceu 10/10').first()).toBeVisible()
    await expect.element(email.getByText('Venceu em 10/10/2026')).toBeVisible()
    await expect.element(email.getByText('MEMBER A · SAO PAULO')).toBeVisible()
    await expect
      .element(email.getByText('Qualquer dúvida, é só responder este e-mail.'))
      .toBeVisible()
    await page.getByRole('button', { name: 'Voltar' }).click()
    await expect
      .element(
        page
          .getByRole('dialog', { name: 'Enviar por e-mail' })
          .getByRole('button', { name: 'Enviar e-mail' }),
      )
      .toBeVisible()
  })

  it('opens a sent charge again to send it once more', async () => {
    await openNewCharge({}, CHARGE_SENT)

    const resend = page.getByRole('dialog', { name: 'Enviar cobrança' })
    await expect.element(resend.getByRole('button', { name: /Enviar pelo WhatsApp/ })).toBeVisible()
    await expect.element(resend.getByText(/criada. Fica como rascunho/)).not.toBeInTheDocument()
  })

  it('offers to retry a refused e-mail, to send by WhatsApp or to fix the address', async () => {
    const { requests, app } = await openNewCharge({
      [`GET ${BASE}/charges`]: () => Response.json([CONTACT_D_CHARGE_FAILED]),
    })
    await page
      .getByRole('dialog', { name: 'Nova cobrança' })
      .getByRole('button', { name: 'Cancelar' })
      .last()
      .click()

    await page.getByRole('button', { name: /Cobrança de 20\/10/ }).click()
    await expect.element(page.getByText(/O e-mail não saiu/)).toBeVisible()
    await page.getByRole('button', { name: 'Tentar o e-mail de novo' }).click()
    await expect.element(page.getByText('E-mail enviado para member.d@exemplo.com.')).toBeVisible()
    expect(requests.map(({ path }) => path)).toEqual(['resend-email'])

    await page.getByRole('button', { name: 'Corrigir e-mail' }).click()
    await expect.poll(() => app.router.state.location.search).toMatchObject({ contact: CONTACT_D })
  })

  it('records a payment for a charge, warns above what is left and links the entry', async () => {
    const paid: unknown[] = []
    const { app } = await openNewCharge(
      {
        [`POST ${BASE}/charges/${CHARGE_SENT}/payments`]: async (request) => {
          paid.push(await request.json())
          return Response.json({ entryId: NEW_CHARGE }, { status: 201 })
        },
      },
      CHARGE_SENT,
    )
    await page
      .getByRole('dialog', { name: 'Enviar cobrança' })
      .getByRole('button', { name: 'Fechar' })
      .last()
      .click()

    await page.getByRole('button', { name: /Cobrança de 20\/10/ }).click()
    await page.getByRole('button', { name: 'Registrar pagamento' }).click()
    const sheet = page.getByRole('dialog', { name: 'Registrar pagamento' })
    await expect.element(sheet.getByText(/nada recebido ainda · falta R\$\s200,00/)).toBeVisible()
    await expect
      .element(sheet.getByRole('textbox', { name: /Valor recebido/ }))
      .toHaveValue('200,00')
    await sheet.getByRole('textbox', { name: /Valor recebido/ }).fill('250,00')
    await expect.element(sheet.getByText(/o excesso fica como crédito do contato/)).toBeVisible()
    await sheet.getByRole('button', { name: 'Registrar pagamento' }).click()

    await expect.element(page.getByText('Pagamento registrado.')).toBeVisible()
    expect(paid).toEqual([
      { amountCents: 25000, receivedInAccountId: MONEY_ACCOUNT, occurredOn: '2026-10-20' },
    ])
    await page.getByRole('button', { name: 'Ver lançamento' }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/entries/${NEW_CHARGE}`)
  })

  describe('on the desktop', () => {
    beforeEach(async () => {
      await page.viewport(1440, 900)
    })

    it('previews the message beside the date and remakes it when the date changes', async () => {
      await openNewCharge(workspaceSettingsAnswer())
      const dialog = page.getByRole('dialog', { name: 'Nova cobrança' })
      const preview = dialog.getByRole('region', { name: 'Prévia da mensagem' })

      await expect.element(preview.getByText(/Oi, Member D! Member A pediu/)).toBeVisible()
      await expect.element(preview.getByText('Vencimento: 10/10/2026')).toBeVisible()
      await expect.element(preview.getByText('Pix copia e cola:')).toBeVisible()
      await expect
        .element(dialog.getByText('O texto fica guardado na cobrança e não muda depois.'))
        .toBeVisible()
      await dialog.getByRole('radio', { name: /Até 10\/11/ }).click()
      await expect.element(preview.getByText(/TV da sala \(parcela 2\/3\)/)).toBeVisible()
      await expect.element(preview.getByText('Vencimento: 10/11/2026')).toBeVisible()
      await expect.element(dialog.getByRole('button', { name: 'Cancelar' }).last()).toBeVisible()
      await expectNoAccessibilityViolations(dialog.element())
    })

    it('puts the message on the left and the Pix and the channels on the right', async () => {
      await openNewCharge()
      await page.getByRole('button', { name: 'Criar cobrança' }).click()
      const created = page.getByRole('dialog', { name: 'Cobrança criada' })

      await expect.element(created.getByText('A mensagem, como Member D vai ler')).toBeVisible()
      await expect
        .element(created.getByRole('button', { name: /Enviar pelo WhatsApp/ }))
        .toBeVisible()
      await expect.element(created.getByRole('button', { name: 'Fechar' }).last()).toBeVisible()
      await expectNoAccessibilityViolations(created.element())
    })
  })
})

import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { MEMBER_A } from '@web/testing/accounts-api'
import {
  CHARGE_SENT,
  CONTACT_D,
  CONTACT_D_CHARGES,
  CONTACT_D_OPEN_ITEMS,
  contactAnswers,
} from '@web/testing/contacts-api'
import { fakeApi, WORKSPACE_ID, workspaceAccess, workspaceList } from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const NEW_CHARGE = '00000000-0000-4000-8000-0000000000c9'

async function openNewCharge(answers: Record<string, FakeAnswer> = {}) {
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
      [`POST ${BASE}/charges/${NEW_CHARGE}/sent`]: async (request) => {
        requests.push({ path: 'sent', body: await request.json() })
        return new Response(null, { status: 204 })
      },
      ...answers,
    }),
  })
  const app = createApp(
    createMemoryHistory({
      initialEntries: [`/w/${WORKSPACE_ID}/contacts/${CONTACT_D}?charge=new`],
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
})

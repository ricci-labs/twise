import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  auditAnswer,
  EDITED_PADARIA,
  HOUSEHOLD_EVENTS,
  manyEvents,
  PADARIA_ID,
} from '@web/testing/audit-api'
import {
  account,
  apiError,
  fakeApi,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const SERVER_ERROR = 500
const BAD_REQUEST = 400
const HISTORY = `/w/${WORKSPACE_ID}/history`
const AUDIT = `GET /api/workspaces/${WORKSPACE_ID}/audit`

async function openHistory(answers: Record<string, FakeAnswer> = auditAnswer(), path = HISTORY) {
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

describe('AUD-01 Histórico', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-30T18:00:00.000Z'))
    await page.viewport(360, 800)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reads as sentences grouped by day, with time, area and reference', async () => {
    await openHistory()

    await expect.element(page.getByRole('heading', { name: 'Histórico', level: 1 })).toBeVisible()
    await expect
      .element(page.getByText('Quem fez o quê no espaço Casa. Só donos e admins veem.'))
      .toBeVisible()
    const today = page.getByRole('region', { name: 'Hoje' })
    await expect
      .element(today.getByRole('link').first())
      .toHaveAccessibleName(
        'Member B editou o lançamento Padaria: valor de R$ 18,50 para R$ 21,00 11:05 · Lançamentos · Ref. a91b2f07',
      )
    await expect.element(today.getByText('Automático')).toBeVisible()
    const yesterday = page.getByRole('region', { name: 'Ontem, 29 out' })
    await expect.element(yesterday.getByText('pelo WhatsApp')).toBeVisible()
    await expect.element(yesterday.getByText(/mudou o papel de/)).toBeVisible()
    await expect.element(page.getByRole('region', { name: 'Ter, 13 out' })).toBeVisible()
    await expect.element(page.getByText('Isso é tudo do histórico.')).toBeVisible()
    expect(document.querySelector('[data-slot=floating-action]')).toBeNull()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('opens the change with before and after, and goes to the entry', async () => {
    await openHistory()

    await page.getByRole('link', { name: /Member B editou o lançamento Padaria/ }).click()

    const sheet = page.getByRole('dialog', { name: 'Mudança' })
    await expect.element(sheet.getByText('Member B editou o lançamento Padaria')).toBeVisible()
    await expect.element(sheet.getByText('Hoje, 11:05 · Pela web')).toBeVisible()
    await expect.element(sheet.getByRole('row', { name: /Valor/ })).toHaveAttribute('data-changed')
    await expect
      .element(sheet.getByRole('link', { name: 'Ver lançamento' }))
      .toHaveAttribute('href', `/w/${WORKSPACE_ID}/entries/${PADARIA_ID}`)

    await sheet.getByRole('button', { name: 'Fechar' }).first().click()
    await expect.element(page.getByRole('dialog', { name: 'Mudança' })).not.toBeInTheDocument()
  })

  it('loads 50 at a time with "Mostrar mais"', async () => {
    await openHistory(auditAnswer([manyEvents(50), [EDITED_PADARIA]]))

    await expect.element(page.getByText('Compra 149')).toBeVisible()
    await page.getByRole('button', { name: 'Mostrar mais' }).click()

    await expect.element(page.getByText('Padaria')).toBeVisible()
    await expect.element(page.getByText('Isso é tudo do histórico.')).toBeVisible()
  })

  it('says when nothing was recorded yet', async () => {
    await openHistory(auditAnswer([[]]))

    await expect.element(page.getByText('Nada registrado ainda.')).toBeVisible()
  })

  it('keeps the page and offers to try again when the history fails', async () => {
    await openHistory({ [AUDIT]: () => apiError('INTERNAL', SERVER_ERROR) })

    await expect.element(page.getByText('Não deu para carregar o histórico.')).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible()
  })

  it('clears filters the API no longer accepts', async () => {
    let calls = 0
    await openHistory(
      {
        [AUDIT]: (request) => {
          calls += 1
          const isFiltered = new URL(request.url).searchParams.has('area')
          return isFiltered
            ? apiError('AUDIT_QUERY_INVALID', BAD_REQUEST)
            : Response.json({ items: HOUSEHOLD_EVENTS, nextCursor: null })
        },
      },
      `${HISTORY}?area=entries`,
    )

    await expect.element(page.getByText('Os filtros não valiam mais e foram limpos.')).toBeVisible()
    await expect.element(page.getByText('Carteira')).toBeVisible()
    expect(calls).toBeGreaterThan(1)
  })

  it('filters by area and by who did it', async () => {
    const queries: string[] = []
    const app = await openHistory({
      [AUDIT]: (request) => {
        queries.push(new URL(request.url).search)
        return Response.json({ items: HOUSEHOLD_EVENTS, nextCursor: null })
      },
    })

    await page.getByRole('button', { name: 'Área' }).click()
    await page
      .getByRole('dialog', { name: 'Área' })
      .getByRole('button', { name: 'Lançamentos' })
      .click()
    await expect.element(page.getByRole('button', { name: 'Área: Lançamentos' })).toBeVisible()

    await page.getByRole('button', { name: 'Quem' }).click()
    await page
      .getByRole('dialog', { name: 'Quem' })
      .getByRole('button', { name: 'Automático' })
      .click()

    await expect
      .poll(() => app.router.state.location.search)
      .toEqual({ area: 'entries', actor: 'automatic' })
    await expect.poll(() => queries.at(-1)).toContain('area=entries')
    expect(queries.at(-1)).toContain('actorId=automatic')
  })

  it('shows only one entry when it comes from the entry, with an X to see everything', async () => {
    const queries: string[] = []
    await openHistory(
      {
        [AUDIT]: (request) => {
          queries.push(new URL(request.url).search)
          return Response.json({ items: [EDITED_PADARIA], nextCursor: null })
        },
      },
      `${HISTORY}?item=${PADARIA_ID}`,
    )

    const item = page.getByRole('region', { name: 'Só este lançamento' })
    await expect.element(item.getByText('Padaria')).toBeVisible()
    expect(queries[0]).toContain(`rowId=${PADARIA_ID}`)
    expect(page.getByRole('button', { name: 'Área' }).query()).toBeNull()

    await item.getByRole('button', { name: 'Ver tudo' }).click()

    await expect.element(page.getByRole('button', { name: 'Área' })).toBeVisible()
    await expect.poll(() => queries.at(-1)).not.toContain('rowId')
  })
})

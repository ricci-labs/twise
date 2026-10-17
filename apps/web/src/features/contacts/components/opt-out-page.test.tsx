import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { apiError, fakeApi, sessionRequired } from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const TOKEN = 'opt-out-token-123'
const OPT_OUT = 'POST /api/public/contacts/opt-out'
const NO_CONTENT = () => new Response(null, { status: 204 })

async function openLink(answer: FakeAnswer = NO_CONTENT, path = `/opt-out#token=${TOKEN}`) {
  const sent: unknown[] = []
  fakeApi({
    'GET /api/auth/me': sessionRequired,
    [OPT_OUT]: async (request) => {
      sent.push(await request.json())
      return answer(request)
    },
  })
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
  await render(
    <StrictMode>
      <AppProviders app={app} />
    </StrictMode>,
  )
  return { app, sent }
}

describe('charge e-mail opt-out page', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opts out once with the token from the link, hides it and confirms', async () => {
    const { app, sent } = await openLink()

    await expect
      .element(
        page.getByRole('heading', { name: /você não vai mais receber cobranças por e-mail/ }),
      )
      .toBeVisible()
    expect(sent).toEqual([{ token: TOKEN }])
    expect(app.router.state.location.hash).toBe('')
    await expectNoAccessibilityViolations(document.body)
  })

  it('says the link no longer works, without a token or when the API refuses it', async () => {
    await openLink(NO_CONTENT, '/opt-out')
    await expect
      .element(page.getByRole('heading', { name: 'Este link não vale mais' }))
      .toBeVisible()

    vi.restoreAllMocks()
    document.body.innerHTML = ''
    await openLink(() => apiError('LINK_INVALID', 400))
    await expect
      .element(page.getByRole('heading', { name: 'Este link não vale mais' }))
      .toBeVisible()
  })

  it('asks to wait after too many tries, and retries when the server failed', async () => {
    await openLink(() => apiError('TOO_MANY_ATTEMPTS', 429))
    await expect.element(page.getByRole('heading', { name: 'Muitas tentativas' })).toBeVisible()

    vi.restoreAllMocks()
    document.body.innerHTML = ''
    let attempts = 0
    const { sent } = await openLink(() => {
      attempts += 1
      return attempts === 1 ? apiError('INTERNAL_ERROR', 500) : NO_CONTENT()
    })
    await expect.element(page.getByRole('heading', { name: 'Não deu certo agora' })).toBeVisible()
    await page.getByRole('button', { name: 'Tentar de novo' }).click()
    await expect
      .element(page.getByRole('heading', { name: /você não vai mais receber/ }))
      .toBeVisible()
    expect(sent).toHaveLength(2)
  })
})

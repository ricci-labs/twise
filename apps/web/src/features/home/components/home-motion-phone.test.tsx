import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { demoAnswers } from '@web/testing/demo-api'
import {
  account,
  fakeApi,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const HOME = `/w/${WORKSPACE_ID}`

describe('HOME-01 motion on the phone', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('holds each card on the phone until it scrolls into view', async () => {
    await page.viewport(390, 844)
    await openHome()

    const cards = [...document.querySelectorAll('[data-slot=home-grid] > *')]
    const last = cards.at(-1) as Element
    expect(last.hasAttribute('data-in-view')).toBe(false)
    expect(getComputedStyle(last).animationPlayState).toBe('paused')

    last.scrollIntoView()

    await expect.poll(() => last.hasAttribute('data-in-view')).toBe(true)
    expect(getComputedStyle(last).animationPlayState).toBe('running')
  })
})

async function openHome() {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
    ...demoAnswers(),
  })
  const app = createApp(createMemoryHistory({ initialEntries: [HOME] }))
  const screen = await render(<AppProviders app={app} />)
  await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
  return screen
}

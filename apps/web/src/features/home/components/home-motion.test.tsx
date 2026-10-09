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

describe('HOME-01 motion', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('plays the entrance on the first visit of the session only', async () => {
    await page.viewport(1440, 900)
    fakeApi({
      'GET /api/auth/me': account,
      'GET /api/workspaces': () => workspaceList(),
      [`GET /api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
      ...demoAnswers(),
    })
    const app = createApp(createMemoryHistory({ initialEntries: [HOME] }))
    const screen = await render(<AppProviders app={app} />)
    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
    expect(document.querySelector('[data-entrance="play"]')).not.toBeNull()

    await screen.getByRole('link', { name: 'Cartões' }).first().click()
    await expect.element(screen.getByRole('heading', { name: 'Em breve' })).toBeVisible()
    await screen.getByRole('link', { name: 'Início' }).first().click()

    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
    expect(document.querySelector('[data-entrance="play"]')).toBeNull()
  })
})

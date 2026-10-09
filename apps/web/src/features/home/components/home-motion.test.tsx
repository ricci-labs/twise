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

    const animationOf = (selector: string) =>
      getComputedStyle(document.querySelector(selector) as Element).animationName
    expect(animationOf('[data-slot=forecast-chart] .recharts-area')).toBe('home-draw')
    expect(animationOf('[data-slot=forecast-chart] .recharts-area-area')).toBe('home-fade')
    expect(animationOf('[data-slot=forecast-chart] .recharts-reference-dot')).toBe('home-dot-pop')
    expect(animationOf('[data-slot=committed-chart] .recharts-bar-rectangle')).toBe('home-grow')
    expect(animationOf('[data-slot=committed-chart] .recharts-reference-line')).toBe('home-fade')
    const bars = [...document.querySelectorAll('[data-slot=budget-rows] [data-slot=progress-bar]')]
    const fillDelays = bars.map(
      (bar) => getComputedStyle(bar.children[1] as Element).animationDelay,
    )
    expect(fillDelays.slice(0, 2)).toEqual(['0.55s', '0.61s'])
    expect(animationOf('[data-slot=kpi-card][data-tone=mint] [data-slot=kpi-art]')).toBe('home-pop')

    await screen.getByRole('link', { name: 'Cartões' }).first().click()
    await expect.element(screen.getByRole('heading', { name: 'Em breve' })).toBeVisible()
    await screen.getByRole('link', { name: 'Início' }).first().click()

    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
    expect(document.querySelector('[data-entrance="play"]')).toBeNull()
  })

  it('only slides the numbers in when the period changes, without replaying the entrance', async () => {
    await page.viewport(1440, 900)
    const screen = await openHome()

    await screen.getByRole('link', { name: 'Período anterior' }).click()

    await expect
      .poll(() => document.querySelector('[data-swap]')?.getAttribute('data-swap'))
      .toBe('a')
    expect(document.querySelector('[data-entrance="play"]')).toBeNull()
    const amount = document.querySelector('[data-slot=kpi-value] [data-slot=amount]') as Element
    expect(getComputedStyle(amount).animationName).toBe('home-swap-a')
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

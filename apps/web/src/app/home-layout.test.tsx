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

const SIDEBAR_OPEN = 264
const SIDEBAR_COLLAPSED = 76
const SIDE_PADDING = 32
const MAX_CONTENT = 1600

async function openHome(width: number) {
  await page.viewport(width, 900)
  fakeApi({
    ...demoAnswers(),
    '/api/auth/me': account,
    '/api/health/ready': () => Response.json({ status: 'ready', version: 'dev' }),
    '/api/workspaces': () => workspaceList(),
    [`/api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}`] }))
  const screen = await render(<AppProviders app={app} />)
  await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
  return screen
}

function widthOf(slot: string): number {
  return document.querySelector(`[data-slot=${slot}]`)?.getBoundingClientRect().width ?? 0
}

function rowsAreEven(): boolean {
  const cards = [...document.querySelectorAll('[data-slot=home-grid] > *')]
  const rows = new Map<number, number[]>()
  for (const card of cards) {
    const box = card.getBoundingClientRect()
    rows.set(Math.round(box.top), [
      ...(rows.get(Math.round(box.top)) ?? []),
      Math.round(box.height),
    ])
  }
  return [...rows.values()].every((heights) => new Set(heights).size === 1)
}

describe('Home layout on the desktop', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    localStorage.clear()
    await page.viewport(390, 844)
  })

  it.each([1280, 1440])('fills the width beside the sidebar at %i px', async (width) => {
    await openHome(width)

    expect(widthOf('home-grid')).toBe(width - SIDEBAR_OPEN - 2 * SIDE_PADDING)
    expect(rowsAreEven()).toBe(true)
  })

  it('grows with the content when the sidebar collapses', async () => {
    const screen = await openHome(1440)

    await screen.getByRole('button', { name: 'Recolher o menu' }).click()

    await expect.poll(() => widthOf('home-grid')).toBe(1440 - SIDEBAR_COLLAPSED - 2 * SIDE_PADDING)
    expect(widthOf('forecast-chart')).toBeGreaterThan(widthOf('home-grid') / 2)
  })

  it('stops at 1600 px and centers it beyond that', async () => {
    await openHome(1920)

    const grid = document.querySelector('[data-slot=home-grid]')?.getBoundingClientRect()
    expect(grid?.width).toBe(MAX_CONTENT - 2 * SIDE_PADDING)
    const main = document.querySelector('main')?.getBoundingClientRect()
    const left = (grid?.left ?? 0) - (main?.left ?? 0)
    const right = (main?.right ?? 0) - (grid?.right ?? 0)
    expect(Math.round(left)).toBe(Math.round(right))
  })
})

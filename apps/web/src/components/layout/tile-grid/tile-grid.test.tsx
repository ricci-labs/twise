import { TileGrid } from '@web/components/layout/tile-grid/tile-grid'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const WIDE_SCREEN = 1440
const WIDER_SCREEN = 1920
const ROUNDING_PX = 1

function tiles(count: number) {
  return Array.from({ length: count }, (_, index) => `Bloco ${index + 1}`).map((name) => (
    <li key={name}>{name}</li>
  ))
}

function rowsOf(grid: HTMLElement): number[][] {
  const rows = new Map<number, number[]>()
  for (const tile of Array.from(grid.children)) {
    const box = tile.getBoundingClientRect()
    rows.set(Math.round(box.top), [...(rows.get(Math.round(box.top)) ?? []), box.width])
  }
  return [...rows.values()]
}

describe('TileGrid', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('fills the last row: five tiles become three and two wider ones', async () => {
    await page.viewport(WIDE_SCREEN, 900)
    const screen = await render(<TileGrid render={<ul className="w-278" />}>{tiles(5)}</TileGrid>)
    const grid = screen.container.querySelector('[data-slot=tile-grid]') as HTMLElement
    const [first, second] = rowsOf(grid)

    expect(first).toHaveLength(3)
    expect(second).toHaveLength(2)
    const rowWidth = grid.getBoundingClientRect().width
    const gap = Number.parseFloat(getComputedStyle(grid).columnGap)
    expect(
      Math.abs((second ?? []).reduce((sum, width) => sum + width, 0) + gap - rowWidth),
    ).toBeLessThanOrEqual(ROUNDING_PX)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('puts four in a row on a 1920 px screen', async () => {
    await page.viewport(WIDER_SCREEN, 900)
    const screen = await render(<TileGrid render={<ul className="w-384" />}>{tiles(4)}</TileGrid>)
    const grid = screen.container.querySelector('[data-slot=tile-grid]') as HTMLElement

    expect(rowsOf(grid).map((row) => row.length)).toEqual([4])
  })

  it('keeps three in a row on a 1920 px screen when four would leave one alone', async () => {
    await page.viewport(WIDER_SCREEN, 900)
    const screen = await render(<TileGrid render={<ul className="w-384" />}>{tiles(5)}</TileGrid>)
    const grid = screen.container.querySelector('[data-slot=tile-grid]') as HTMLElement

    expect(rowsOf(grid).map((row) => row.length)).toEqual([3, 2])
  })

  it('gives a lone tile the whole row', async () => {
    await page.viewport(WIDER_SCREEN, 900)
    const screen = await render(<TileGrid render={<ul className="w-384" />}>{tiles(1)}</TileGrid>)
    const grid = screen.container.querySelector('[data-slot=tile-grid]') as HTMLElement

    expect(rowsOf(grid)).toEqual([[grid.getBoundingClientRect().width]])
  })

  it('stacks the tiles on the phone', async () => {
    const screen = await render(<TileGrid render={<ul />}>{tiles(3)}</TileGrid>)
    const grid = screen.container.querySelector('[data-slot=tile-grid]') as HTMLElement

    expect(rowsOf(grid).map((row) => row.length)).toEqual([1, 1, 1])
  })
})

import { WorkScreen } from '@web/components/layout/work-screen/work-screen'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const ROWS = Array.from({ length: 60 }, (_, index) => `Linha ${index + 1}`)

function Screen({ onNearEnd }: { onNearEnd?: () => void }) {
  return (
    <div className="flex h-screen flex-col p-4">
      <WorkScreen
        listLabel="Lista"
        listHeader={<strong>Filtros</strong>}
        list={
          <ul>
            {ROWS.map((row) => (
              <li key={row} className="py-3">
                {row}
              </li>
            ))}
          </ul>
        }
        detailLabel="Detalhe"
        detailHeader={<strong>Mudança</strong>}
        detail={<p>O detalhe</p>}
        onNearEnd={onNearEnd}
      />
    </div>
  )
}

describe('WorkScreen', () => {
  it('keeps the page still and scrolls each named pane on its own', async () => {
    await page.viewport(1440, 900)
    const screen = await render(<Screen />)

    const list = screen.getByRole('region', { name: 'Lista' })
    const detail = screen.getByRole('region', { name: 'Detalhe' })
    await expect.element(list).toHaveAttribute('tabindex', '0')
    await expect.element(detail).toHaveAttribute('tabindex', '0')
    const pane = list.element() as HTMLElement
    expect(pane.scrollHeight).toBeGreaterThan(pane.clientHeight)
    expect(document.documentElement.scrollHeight).toBeLessThanOrEqual(window.innerHeight)
    expect(pane.getBoundingClientRect().bottom).toBeCloseTo(
      detail.element().getBoundingClientRect().bottom,
      0,
    )
    await expectNoAccessibilityViolations(screen.container)
  })

  it('asks for more when the list scrolls near its end', async () => {
    await page.viewport(1440, 900)
    const onNearEnd = vi.fn()
    const screen = await render(<Screen onNearEnd={onNearEnd} />)

    expect(onNearEnd).not.toHaveBeenCalled()
    const pane = screen.getByRole('region', { name: 'Lista' }).element() as HTMLElement
    pane.scrollTop = pane.scrollHeight

    await expect.poll(() => onNearEnd.mock.calls.length).toBeGreaterThan(0)
  })

  it('becomes a page that scrolls below 700 px of height, without loading on its own', async () => {
    await page.viewport(1280, 680)
    const onNearEnd = vi.fn()
    const screen = await render(<Screen onNearEnd={onNearEnd} />)

    const pane = screen.getByRole('region', { name: 'Lista' }).element() as HTMLElement
    expect(pane.scrollHeight).toBeLessThanOrEqual(pane.clientHeight)
    expect(document.documentElement.scrollHeight).toBeGreaterThan(window.innerHeight)
    expect(screen.container.querySelector('[data-tall]')).toBeNull()
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(onNearEnd).not.toHaveBeenCalled()
  })
})

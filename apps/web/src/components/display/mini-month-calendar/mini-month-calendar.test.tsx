import { MiniMonthCalendar } from '@web/components/display/mini-month-calendar/mini-month-calendar'
import type { MiniMonthCalendarProps } from '@web/components/display/mini-month-calendar/mini-month-calendar.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { expectClampedToTwoLines } from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const NOVEMBER: MiniMonthCalendarProps = {
  month: '2026-11',
  today: '2026-10-15',
  nextOn: '2026-11-02',
  holidays: [
    { onDate: '2026-11-20', name: 'Dia da Consciência Negra', kind: 'national' },
    { onDate: '2026-11-02', name: 'Finados', kind: 'national' },
  ],
}

function dayOf(container: HTMLElement, day: number) {
  return [...container.querySelectorAll('[data-slot=mini-month-day]')].find(
    (element) => element.textContent === String(day),
  )
}

describe('MiniMonthCalendar', () => {
  it('is a region named by the month, with its holidays listed in order under the grid', async () => {
    const screen = await render(<MiniMonthCalendar {...NOVEMBER} />)
    const month = screen.getByRole('region', { name: 'Novembro' })
    const items = month.getByRole('listitem').elements()
    expect(items.map((item) => item.textContent)).toEqual([
      '02Finados',
      '20Dia da Consciência Negra',
    ])
    await expectNoAccessibilityViolations(screen.container)
  })

  it('starts on Sunday and leaves the grid to sighted readers', async () => {
    const screen = await render(<MiniMonthCalendar {...NOVEMBER} />)
    const grid = screen.container.querySelector('[aria-hidden=true]')
    const firstDay = dayOf(screen.container, 1)?.parentElement
    expect([...(grid?.children ?? [])].indexOf(firstDay as Element)).toBe(7)
  })

  it('fills the national days in ink, rings the next one and marks today', async () => {
    const screen = await render(<MiniMonthCalendar {...NOVEMBER} today="2026-11-10" />)
    const next = dayOf(screen.container, 2)
    const today = dayOf(screen.container, 10)
    const plain = dayOf(screen.container, 11)
    expect(next && getComputedStyle(next).backgroundColor).not.toBe(
      plain && getComputedStyle(plain).backgroundColor,
    )
    expect(next && getComputedStyle(next).boxShadow).not.toBe('none')
    expect(today && getComputedStyle(today).boxShadow).not.toBe('none')
  })

  it('tags a workspace holiday and says when a month has none', async () => {
    const screen = await render(
      <>
        <MiniMonthCalendar
          month="2026-12"
          today="2026-10-15"
          nextOn={null}
          holidays={[{ onDate: '2026-12-08', name: 'Padroeira da cidade', kind: 'workspace' }]}
        />
        <MiniMonthCalendar month="2026-03" today="2026-10-15" nextOn={null} holidays={[]} />
      </>,
    )
    await expect
      .element(screen.getByRole('region', { name: 'Dezembro' }).getByText('espaço'))
      .toBeVisible()
    await expect
      .element(screen.getByRole('region', { name: 'Março' }).getByText('Sem feriados'))
      .toBeVisible()
  })

  it('keeps a long holiday name to two lines', async () => {
    await page.viewport(360, 800)
    const name = 'Aniversário da cidade e padroeira municipal com feriado prolongado'
    const screen = await render(
      <div className="w-60">
        <MiniMonthCalendar
          month="2026-12"
          today="2026-10-15"
          nextOn={null}
          holidays={[{ onDate: '2026-12-08', name, kind: 'workspace' }]}
        />
      </div>,
    )
    expectClampedToTwoLines(screen.getByText(name).element())
  })
})

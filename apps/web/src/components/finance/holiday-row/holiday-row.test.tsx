import { HolidayRow } from '@web/components/finance/holiday-row/holiday-row'
import type { HolidayRowProps } from '@web/components/finance/holiday-row/holiday-row.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { expectClampedToTwoLines } from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const LONG_NAME = 'Aniversário da cidade e padroeira municipal com feriado prolongado de verdade'

function inList(props: Partial<HolidayRowProps>) {
  return render(
    <ul>
      <HolidayRow onDate="2026-11-02" name="Finados" status="upcoming" {...props} />
    </ul>,
  )
}

describe('HolidayRow', () => {
  it('shows the padded day, the name and the weekday, with the date for screen readers', async () => {
    const screen = await inList({})
    await expect.element(screen.getByText('02', { exact: true })).toBeVisible()
    await expect.element(screen.getByText('seg', { exact: true })).toBeVisible()
    expect(screen.getByRole('listitem').element().textContent).toContain('2 de novembro: Finados')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('marks the next one with the badge first', async () => {
    const screen = await inList({ status: 'next' })
    await expect.element(screen.getByText('Próximo')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('says when it falls on a weekend', async () => {
    const screen = await inList({ onDate: '2026-11-15', name: 'Proclamação da República' })
    await expect.element(screen.getByText('dom · cai no fim de semana')).toBeVisible()
  })

  it('mutes a past one and keeps the actions slot at the end', async () => {
    const screen = await inList({
      status: 'past',
      actions: <button type="button">Ações</button>,
    })
    await expect.element(screen.getByRole('button', { name: 'Ações' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('clamps a long name to two lines at 360 px', async () => {
    await page.viewport(360, 640)
    const screen = await inList({ name: LONG_NAME, actions: <button type="button">⋯</button> })
    expectClampedToTwoLines(screen.getByText(LONG_NAME).element())
  })
})

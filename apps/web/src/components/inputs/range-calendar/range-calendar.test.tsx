import type { IsoDate } from '@financas/shared'
import { RangeCalendar } from '@web/components/inputs/range-calendar/range-calendar'
import type { DateRange } from '@web/components/inputs/range-calendar/range-calendar.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const TODAY = '2026-10-20' as IsoDate

function Picker({ initial = { from: null, to: null } }: { initial?: DateRange }) {
  const [range, setRange] = useState(initial)
  return (
    <>
      <RangeCalendar value={range} today={TODAY} onChange={setRange} />
      <p>{`${range.from ?? '—'} ${range.to ?? '—'}`}</p>
    </>
  )
}

describe('RangeCalendar', () => {
  it('takes the first and then the last day, and marks the days between', async () => {
    const screen = await render(<Picker />)

    await screen.getByRole('button', { name: '5 de outubro' }).click()
    await expect.element(screen.getByText('2026-10-05 —')).toBeVisible()
    await expect.element(screen.getByRole('status')).toHaveTextContent('De5 outAtéEscolha')
    await screen.getByRole('button', { name: '20 de outubro' }).click()

    await expect.element(screen.getByText('2026-10-05 2026-10-20')).toBeVisible()
    await expect
      .element(screen.getByRole('button', { name: '5 de outubro' }))
      .toHaveAttribute('aria-pressed', 'true')
    await expect
      .element(screen.getByRole('button', { name: '20 de outubro' }))
      .toHaveAttribute('aria-pressed', 'true')
    const between = screen.getByRole('button', { name: '12 de outubro' }).element()
    expect(between.parentElement?.className).toContain('bg-sunken')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('starts again from a day before the first one', async () => {
    const screen = await render(<Picker initial={{ from: '2026-10-10' as IsoDate, to: null }} />)

    await screen.getByRole('button', { name: '3 de outubro' }).click()
    await expect.element(screen.getByText('2026-10-03 —')).toBeVisible()
  })

  it('starts a new range once one is complete, and shows the days around the month', async () => {
    const screen = await render(
      <Picker initial={{ from: '2026-10-05' as IsoDate, to: '2026-10-20' as IsoDate }} />,
    )

    await expect.element(screen.getByRole('button', { name: '27 de setembro' })).toBeVisible()
    await screen.getByRole('button', { name: '28 de setembro' }).click()
    await expect.element(screen.getByText('2026-09-28 —')).toBeVisible()
  })
})

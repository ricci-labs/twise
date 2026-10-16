import { NextHolidayCard } from '@web/components/finance/next-holiday-card/next-holiday-card'
import type { NextHoliday } from '@web/components/finance/next-holiday-card/next-holiday-card.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { expectClampedToTwoLines } from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const ALL_SOULS_DAY: NextHoliday = {
  onDate: '2026-11-02',
  name: 'Finados',
  daysAway: 18,
  effects: [{ description: 'Vale-alimentação', toOn: '2026-11-03' }],
}

describe('NextHolidayCard', () => {
  it('shows the date, the name, when it is and the fixed bill it moves', async () => {
    const screen = await render(<NextHolidayCard holiday={ALL_SOULS_DAY} />)
    const card = screen.getByRole('region', { name: 'Próximo feriado' })
    await expect.element(card.getByText('Finados')).toBeVisible()
    await expect.element(card.getByText(/Segunda-feira · daqui a 18 dias/)).toBeVisible()
    await expect
      .element(card.getByText('Muda 1 conta fixa: Vale-alimentação passa para 03/11.'))
      .toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('lists every fixed bill it moves', async () => {
    const screen = await render(
      <NextHolidayCard
        holiday={{
          ...ALL_SOULS_DAY,
          effects: [
            { description: 'Vale-alimentação', toOn: '2026-11-03' },
            { description: 'Aluguel', toOn: '2026-10-30' },
          ],
        }}
      />,
    )
    await expect
      .element(
        screen.getByText(
          'Muda 2 contas fixas: Vale-alimentação passa para 03/11; Aluguel passa para 30/10.',
        ),
      )
      .toBeVisible()
  })

  it('says nothing about the bills when it moves none, and words tomorrow', async () => {
    const screen = await render(
      <NextHolidayCard holiday={{ ...ALL_SOULS_DAY, daysAway: 1, effects: [] }} />,
    )
    await expect.element(screen.getByText(/Segunda-feira · amanhã/)).toBeVisible()
    await expect.element(screen.getByText(/Muda/)).not.toBeInTheDocument()
  })

  it('says when no holiday lies ahead', async () => {
    const screen = await render(<NextHolidayCard holiday={null} />)
    await expect.element(screen.getByText('Nenhum feriado pela frente.')).toBeVisible()
  })

  it('keeps a long name to two lines in a narrow card', async () => {
    await page.viewport(360, 640)
    const name = 'Aniversário da cidade e padroeira municipal com feriado prolongado'
    const screen = await render(<NextHolidayCard holiday={{ ...ALL_SOULS_DAY, name }} />)
    expectClampedToTwoLines(screen.getByText(name).element())
  })
})

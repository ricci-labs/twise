import { NextDatesPreview } from '@web/components/finance/next-dates-preview/next-dates-preview'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('NextDatesPreview', () => {
  it('lists each date with its weekday and amount, a moved one saying why on its own line', async () => {
    const screen = await render(
      <div className="w-90">
        <NextDatesPreview
          dates={[
            { key: '1', date: '10/12', weekday: 'qui', amountCents: 9990 },
            {
              key: '2',
              date: '11/01',
              weekday: 'seg',
              amountCents: 123456789,
              isEstimate: true,
              note: 'dia 10 é domingo, foi para segunda',
            },
          ]}
        />
      </div>,
    )
    await expect.element(screen.getByText('Próximas datas')).toBeVisible()
    await expect.element(screen.getByText('qui')).toBeVisible()
    const amount = screen.getByText('R$ 1.234.567,89').element()
    const note = screen.getByText('dia 10 é domingo, foi para segunda').element()
    expect(note.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      amount.getBoundingClientRect().bottom - 1,
    )
    await expectNoAccessibilityViolations(screen.container)
  })

  it('says why there is nothing to show', async () => {
    const screen = await render(<NextDatesPreview dates={[]} empty="Escolha a primeira data." />)
    await expect.element(screen.getByText('Escolha a primeira data.')).toBeVisible()
  })
})

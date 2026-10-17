import type { IsoDate } from '@financas/shared'
import { UntilChips } from '@web/components/finance/until-chips/until-chips'
import type { UntilNextDue } from '@web/components/finance/until-chips/until-chips.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const TODAY: IsoDate = '2026-10-20'
const NEXT: UntilNextDue = { dueOn: '2026-11-10', installmentCount: 1 }

function Until({
  initial = TODAY,
  next = NEXT,
  onChange = () => undefined,
}: {
  initial?: IsoDate
  next?: UntilNextDue | null
  onChange?: (until: IsoDate) => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <UntilChips
      today={TODAY}
      next={next}
      value={value}
      onChange={(until) => {
        setValue(until)
        onChange(until)
      }}
    />
  )
}

describe('UntilChips', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('offers today, the next due date with what it adds, and another date', async () => {
    await page.viewport(390, 844)
    const screen = await render(<Until />)

    await expect
      .element(screen.getByRole('group', { name: 'Cobrar o que vence até' }))
      .toBeVisible()
    await expect
      .element(screen.getByText('Escolha uma data futura para incluir as próximas parcelas.'))
      .toBeVisible()
    await expect.element(screen.getByRole('radio', { name: 'Hoje, 20/10' })).toBeChecked()
    await expect
      .element(screen.getByRole('radio', { name: 'Até 10/11 · +1 parcela' }))
      .not.toBeChecked()
    await expect
      .element(screen.getByRole('radio', { name: 'Outra data' }))
      .toHaveAttribute('aria-haspopup', 'dialog')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('moves the date to the next due date and back to today', async () => {
    const onChange = vi.fn()
    const screen = await render(
      <Until next={{ dueOn: '2026-11-10', installmentCount: 2 }} onChange={onChange} />,
    )

    await screen.getByRole('radio', { name: 'Até 10/11 · +2 parcelas' }).click()
    expect(onChange).toHaveBeenLastCalledWith('2026-11-10')
    await expect
      .element(screen.getByRole('radio', { name: 'Até 10/11 · +2 parcelas' }))
      .toBeChecked()
    await screen.getByRole('radio', { name: 'Hoje, 20/10' }).click()
    expect(onChange).toHaveBeenLastCalledWith(TODAY)
  })

  it('picks another date in the app calendar and shows it as the chosen chip', async () => {
    await page.viewport(390, 844)
    const onChange = vi.fn()
    const screen = await render(<Until onChange={onChange} />)

    await screen.getByRole('radio', { name: 'Outra data' }).click()
    const calendar = page.getByRole('dialog', { name: 'Cobrar o que vence até' })
    await expect.element(calendar).toBeVisible()
    await page.getByRole('radio', { name: '25 de outubro' }).click()

    await expect.element(calendar).not.toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith('2026-10-25')
    await expect.element(screen.getByRole('radio', { name: 'Até 25/10' })).toBeChecked()
    await screen.getByRole('radio', { name: 'Até 25/10' }).click()
    await expect.element(page.getByRole('dialog')).toBeVisible()
  })

  it('leaves the next shortcut and its help out when nothing comes later', async () => {
    const screen = await render(<Until next={null} />)

    await expect.element(screen.getByRole('radio', { name: 'Outra data' })).toBeVisible()
    expect(screen.getByRole('radio').elements()).toHaveLength(2)
    await expect
      .element(screen.getByText('Escolha uma data futura para incluir as próximas parcelas.'))
      .not.toBeInTheDocument()
  })
})

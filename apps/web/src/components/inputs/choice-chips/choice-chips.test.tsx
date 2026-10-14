import { ChoiceChips } from '@web/components/inputs/choice-chips/choice-chips'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const DATES = [
  { value: 'today', label: 'Hoje, 20 out' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'other', label: 'Outra data', icon: 'calendar', opensDialog: true },
] as const

describe('ChoiceChips', () => {
  it('is a group of radios, the chosen one checked', async () => {
    const screen = await render(
      <ChoiceChips
        label="Data"
        variant="outline"
        options={DATES}
        value="today"
        onSelect={vi.fn()}
      />,
    )

    await expect.element(screen.getByRole('radiogroup', { name: 'Data' })).toBeVisible()
    await expect.element(screen.getByRole('radio', { name: 'Hoje, 20 out' })).toBeChecked()
    await expect.element(screen.getByRole('radio', { name: 'Ontem' })).not.toBeChecked()
    await expect
      .element(screen.getByRole('radio', { name: 'Outra data' }))
      .toHaveAttribute('aria-haspopup', 'dialog')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('tells which option was pressed, even the one already chosen, so it can reopen its dialog', async () => {
    const onSelect = vi.fn()
    const screen = await render(
      <ChoiceChips
        label="Data"
        variant="outline"
        options={DATES}
        value="other"
        onSelect={onSelect}
      />,
    )

    await screen.getByRole('radio', { name: 'Ontem' }).click()
    expect(onSelect).toHaveBeenLastCalledWith('yesterday')
    await screen.getByRole('radio', { name: 'Outra data' }).click()
    expect(onSelect).toHaveBeenLastCalledWith('other')
  })

  it('moves the choice with the arrow keys', async () => {
    const onSelect = vi.fn()
    const screen = await render(
      <ChoiceChips
        label="Data"
        variant="outline"
        options={DATES}
        value="today"
        onSelect={onSelect}
      />,
    )

    await screen.getByRole('radio', { name: 'Hoje, 20 out' }).click()
    await userEvent.keyboard('{ArrowRight}')
    expect(onSelect).toHaveBeenLastCalledWith('yesterday')
  })

  it('shows each person with an initial', async () => {
    const screen = await render(
      <ChoiceChips
        label="Quem gastou"
        variant="card"
        options={[
          { value: 'a', label: 'Member A', avatarName: 'Member A' },
          { value: 'b', label: 'Member B', avatarName: 'Member B' },
        ]}
        value="b"
        onSelect={vi.fn()}
      />,
    )

    await expect.element(screen.getByRole('radio', { name: 'Member B' })).toBeChecked()
    await expectNoAccessibilityViolations(screen.container)
  })
})

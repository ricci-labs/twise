import { RadioSentenceList } from '@web/components/inputs/radio-sentence-list/radio-sentence-list'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function rules(onPicker: () => void) {
  return [
    {
      value: 'day',
      label: 'No dia 10 do mês',
      before: 'No dia',
      after: 'do mês',
      picker: (
        <button type="button" aria-label="Dia do mês: 10" onClick={onPicker}>
          10
        </button>
      ),
    },
    {
      value: 'sameDay',
      label: 'No mesmo dia da primeira data',
      before: 'No mesmo dia da primeira data',
    },
  ]
}

describe('RadioSentenceList', () => {
  it('is a group of radios named by their whole sentence, the chosen one outlined', async () => {
    const screen = await render(
      <RadioSentenceList label="Quando" options={rules(vi.fn())} value="day" onSelect={vi.fn()} />,
    )
    const group = screen.getByRole('radiogroup', { name: 'Quando' })
    await expect
      .element(group.getByRole('radio', { name: 'No dia 10 do mês' }))
      .toHaveAttribute('aria-checked', 'true')
    const card = document.querySelector('[data-slot=radio-sentence]') as HTMLElement
    expect(getComputedStyle(card).fontWeight).toBe('650')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('picks a sentence pressed anywhere on its card, but leaves its picker to itself', async () => {
    const onSelect = vi.fn()
    const onPicker = vi.fn()
    const screen = await render(
      <RadioSentenceList
        label="Quando"
        options={rules(onPicker)}
        value="day"
        onSelect={onSelect}
      />,
    )
    const [, sameDayCard] = screen.container.querySelectorAll('[data-slot=radio-sentence]')
    await userEvent.click(sameDayCard as HTMLElement)
    expect(onSelect).toHaveBeenCalledWith('sameDay')

    await screen.getByRole('button', { name: 'Dia do mês: 10' }).click()
    expect(onPicker).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('shows the choice dimmed and keeps it when disabled', async () => {
    const onSelect = vi.fn()
    const screen = await render(
      <RadioSentenceList
        label="Quando"
        options={rules(vi.fn())}
        value="day"
        onSelect={onSelect}
        disabled
      />,
    )
    const sameDay = screen.getByRole('radio', { name: 'No mesmo dia da primeira data' })
    await expect.element(sameDay).toBeDisabled()
    const [, sameDayCard] = screen.container.querySelectorAll('[data-slot=radio-sentence]')
    await userEvent.click(sameDayCard as HTMLElement, { force: true })
    expect(onSelect).not.toHaveBeenCalled()
    const group = screen.getByRole('radiogroup', { name: 'Quando' }).element()
    expect(getComputedStyle(group).opacity).toBe('0.6')
  })
})

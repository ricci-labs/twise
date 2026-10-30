import { SegmentedControl } from '@web/components/actions/segmented-control/segmented-control'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('SegmentedControl', () => {
  it('marks the chosen option as pressed and tells when another is picked', async () => {
    const onValueChange = vi.fn()
    const screen = await render(
      <SegmentedControl
        label="Conta"
        options={[
          { value: 'x', label: 'Conta X' },
          { value: 'y', label: 'Conta Y' },
        ]}
        value="x"
        onValueChange={onValueChange}
      />,
    )

    await expect
      .element(screen.getByRole('button', { name: 'Conta X' }))
      .toHaveAttribute('aria-pressed', 'true')
    await screen.getByRole('button', { name: 'Conta Y' }).click()
    expect(onValueChange).toHaveBeenCalledWith('y')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('marks the chosen tab with the 2 px ink outline and a bold label when asked', async () => {
    const screen = await render(
      <SegmentedControl
        label="Partes"
        selection="outline"
        options={[
          { value: 'a', label: 'Previstos' },
          { value: 'b', label: 'Metas' },
        ]}
        value="a"
        onValueChange={vi.fn()}
      />,
    )
    const chosen = getComputedStyle(screen.getByRole('button', { name: 'Previstos' }).element())
    const other = getComputedStyle(screen.getByRole('button', { name: 'Metas' }).element())
    expect(Number(chosen.fontWeight)).toBeGreaterThan(Number(other.fontWeight))
    expect(chosen.boxShadow).toContain('inset')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps the choice and dims the control when disabled', async () => {
    const onValueChange = vi.fn()
    const screen = await render(
      <SegmentedControl
        label="A semana começa no"
        options={[
          { value: '0', label: 'Domingo' },
          { value: '1', label: 'Segunda-feira' },
        ]}
        value="0"
        onValueChange={onValueChange}
        isDisabled
      />,
    )

    const monday = screen.getByRole('button', { name: 'Segunda-feira' })
    await expect.element(monday).toBeDisabled()
    await monday.click({ force: true })
    expect(onValueChange).not.toHaveBeenCalled()
    const group = screen.container.querySelector('[data-slot=segmented-control]') as HTMLElement
    expect(getComputedStyle(group).opacity).toBe('0.6')
  })
})

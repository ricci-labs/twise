import { AllocationStepRow } from '@web/components/finance/allocation-step-row/allocation-step-row'
import type { AllocationStepRowProps } from '@web/components/finance/allocation-step-row/allocation-step-row.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { expectClampedToTwoLines } from '@web/testing/long-text'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const SAVINGS: AllocationStepRowProps = {
  position: 1,
  title: 'R$ 600,00 para a Poupança',
  detail: 'Valor fixo · a reserva de emergência',
  art: { name: 'Poupança', icon: 'piggy-bank' },
}

const LONG_NAME = 'Investimento para a troca do carro da família em 2027 '.repeat(3).trim()

function MoreButton() {
  return (
    <button type="button" aria-label="Ações de R$ 600,00 para a Poupança">
      ⋯
    </button>
  )
}

function inList(props: Partial<AllocationStepRowProps>) {
  return render(
    <div className="w-90">
      <ol>
        <AllocationStepRow {...SAVINGS} actions={<MoreButton />} {...props} />
      </ol>
    </div>,
  )
}

describe('AllocationStepRow', () => {
  it('shows "Passo N" above the title, the detail, the grip and the actions', async () => {
    const screen = await inList({})
    await expect.element(screen.getByText('Passo 1')).toBeVisible()
    await expect.element(screen.getByText('R$ 600,00 para a Poupança')).toBeVisible()
    await expect.element(screen.getByText('Valor fixo · a reserva de emergência')).toBeVisible()
    await expect
      .element(screen.getByRole('button', { name: 'Arrastar para mudar a ordem' }))
      .toBeVisible()
    await expect
      .element(screen.getByRole('button', { name: 'Ações de R$ 600,00 para a Poupança' }))
      .toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('hands the drag handlers to the grip, keeping its name', async () => {
    const onPointerDown = vi.fn()
    const screen = await inList({ gripProps: { onPointerDown, 'aria-describedby': 'hint' } })
    const grip = screen.getByRole('button', { name: 'Arrastar para mudar a ordem' })
    await grip.click()
    expect(onPointerDown).toHaveBeenCalled()
    expect(grip.element().getAttribute('aria-describedby')).toBe('hint')
  })

  it('lifts the card while it is dragged', async () => {
    const screen = await inList({ isLifted: true })
    const row = screen.getByRole('listitem').element()
    expect(row.getAttribute('data-lifted')).toBe('true')
    expect(getComputedStyle(row).boxShadow).not.toBe('none')
    expect(getComputedStyle(row).scale).toContain('1.02')
  })

  it('marks a step pointing to a deleted goal and says how to fix it', async () => {
    const screen = await inList({ isInvalid: true })
    const message = screen.getByText('Meta excluída. Remova este passo para salvar.')
    await expect.element(message).toBeVisible()
    const position = screen.getByText('Passo 1').element()
    expect(getComputedStyle(position).color).toBe(getComputedStyle(message.element()).color)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('drops the grip and the actions for a viewer and pads the drawing off the edge', async () => {
    const screen = await inList({ isReadOnly: true })
    expect(screen.getByRole('button').elements()).toHaveLength(0)
    const row = screen.getByRole('listitem').element()
    expect(getComputedStyle(row).paddingLeft).toBe('16px')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps at least 72 px of height', async () => {
    const screen = await inList({ detail: undefined })
    const row = screen.getByRole('listitem').element()
    expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(72)
  })

  it('cuts a long title and detail after two lines each', async () => {
    const screen = await inList({ title: LONG_NAME, detail: LONG_NAME })
    for (const text of screen.getByText(LONG_NAME).elements()) {
      expectClampedToTwoLines(text)
    }
    const row = screen.getByRole('listitem').element()
    const more = screen.getByRole('button', { name: /Ações/ }).element()
    expect(more.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right,
    )
  })
})

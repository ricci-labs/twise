import { Stepper } from '@web/components/inputs/stepper/stepper'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

function Installments({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial)
  return (
    <Stepper
      value={count}
      min={1}
      max={3}
      onChange={setCount}
      valueText={count === 1 ? 'À vista' : `${count}×`}
      decreaseLabel="Menos uma parcela"
      increaseLabel="Mais uma parcela"
      aside={`${count}× de **R$ 10,00**`}
    />
  )
}

describe('Stepper', () => {
  it('steps the value and stops at both ends', async () => {
    const screen = await render(<Installments initial={1} />)
    const less = screen.getByRole('button', { name: 'Menos uma parcela' })
    const more = screen.getByRole('button', { name: 'Mais uma parcela' })

    await expect.element(screen.getByText('À vista')).toBeVisible()
    await expect.element(less).toBeDisabled()
    await more.click()
    await more.click()
    await expect.element(screen.getByRole('status')).toHaveTextContent('3×')
    await expect.element(more).toBeDisabled()
    await less.click()
    await expect.element(screen.getByRole('status')).toHaveTextContent('2×')
  })

  it('shows the value of each part beside it', async () => {
    const screen = await render(<Installments initial={2} />)
    await expect.element(screen.getByText('R$ 10,00')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})

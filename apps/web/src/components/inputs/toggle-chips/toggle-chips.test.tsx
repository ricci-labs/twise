import { ToggleChips } from '@web/components/inputs/toggle-chips/toggle-chips'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const OPTIONS = [
  { value: 'expense', label: 'Despesa' },
  { value: 'card_purchase', label: 'Compra no cartão' },
  { value: 'income', label: 'Receita' },
]

function Types() {
  const [value, setValue] = useState<string[]>([])
  return (
    <>
      <ToggleChips label="Tipo" options={OPTIONS} value={value} onChange={setValue} />
      <p>{value.join(',') || 'nenhum'}</p>
    </>
  )
}

describe('ToggleChips', () => {
  it('turns several options on and off, each pressed while chosen', async () => {
    const screen = await render(<Types />)
    const card = screen.getByRole('button', { name: 'Compra no cartão' })

    await card.click()
    await screen.getByRole('button', { name: 'Receita' }).click()
    await expect.element(card).toHaveAttribute('aria-pressed', 'true')
    await expect.element(screen.getByText('card_purchase,income')).toBeVisible()
    await card.click()
    await expect.element(screen.getByText('income', { exact: true })).toBeVisible()
    await expect.element(screen.getByRole('group', { name: 'Tipo' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})

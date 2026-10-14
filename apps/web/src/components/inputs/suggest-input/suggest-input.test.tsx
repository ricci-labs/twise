import { SuggestInput } from '@web/components/inputs/suggest-input/suggest-input'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const RECENT = ['Mercado da semana', 'Mercado Livre']

function Harness({ onPick }: { onPick: (value: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <SuggestInput
      aria-label="Descrição"
      value={value}
      suggestions={value === '' ? [] : RECENT}
      onChange={(change) => setValue(change.target.value)}
      onPick={onPick}
    />
  )
}

describe('SuggestInput', () => {
  it('offers what matches what was typed and tells which one was picked', async () => {
    const onPick = vi.fn()
    const screen = await render(<Harness onPick={onPick} />)
    await screen.getByRole('combobox', { name: 'Descrição' }).fill('Mer')

    await expect.element(screen.getByRole('option', { name: 'Mercado da semana' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
    await screen.getByRole('option', { name: 'Mercado Livre' }).click()

    expect(onPick).toHaveBeenCalledWith('Mercado Livre')
    await expect.element(screen.getByRole('combobox')).toHaveValue('Mercado Livre')
  })

  it('starts on the first suggestion and picks with the keyboard', async () => {
    const onPick = vi.fn()
    const screen = await render(<Harness onPick={onPick} />)
    await screen.getByRole('combobox', { name: 'Descrição' }).fill('Mer')
    await expect.element(screen.getByRole('option', { name: 'Mercado da semana' })).toBeVisible()

    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onPick).toHaveBeenCalledWith('Mercado Livre')
  })
})

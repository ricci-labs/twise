import { FilterChips } from '@web/components/display/filter-chips/filter-chips'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const CHIPS = [
  { value: 'type', label: 'Compra no cartão' },
  { value: 'account', label: 'Cartão X' },
]

describe('FilterChips', () => {
  it('takes one filter off, or all of them with "Limpar"', async () => {
    const onRemove = vi.fn()
    const onClear = vi.fn()
    const screen = await render(<FilterChips chips={CHIPS} onRemove={onRemove} onClear={onClear} />)

    await expect.element(screen.getByRole('group', { name: 'Filtros ativos' })).toBeVisible()
    await screen.getByRole('button', { name: 'Tirar o filtro Cartão X' }).click()
    expect(onRemove).toHaveBeenCalledWith('account')
    await screen.getByRole('button', { name: 'Limpar' }).click()
    expect(onClear).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows nothing without a filter', async () => {
    const screen = await render(<FilterChips chips={[]} onRemove={vi.fn()} onClear={vi.fn()} />)
    expect(screen.container.querySelector('[data-slot=filter-chips]')).toBeNull()
  })
})

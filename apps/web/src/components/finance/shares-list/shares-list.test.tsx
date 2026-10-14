import { SharesCollapsed, SharesList } from '@web/components/finance/shares-list/shares-list'
import type { SharesListProps } from '@web/components/finance/shares-list/shares-list.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

function renderShares(props: Partial<SharesListProps> = {}) {
  const handlers = {
    onAmountChange: vi.fn(),
    onRemove: vi.fn(),
    onAdd: vi.fn(),
    onHalf: vi.fn(),
    onEqually: vi.fn(),
  }
  const screen = render(
    <SharesList
      rows={[{ key: 'c', contactName: 'Member C', amountText: '80,00' }]}
      yoursName="Member A"
      yoursCents={16_000}
      canAdd
      {...handlers}
      {...props}
    />,
  )
  return { screen, ...handlers }
}

describe('SharesList', () => {
  it('names each share by its contact and shows your part in the same column', async () => {
    const { screen, onAmountChange } = renderShares()
    const share = (await screen).getByRole('textbox', { name: 'Parte de Member C' })

    await expect.element(share).toHaveValue('80,00')
    await expect.element((await screen).getByText(/R\$\s160,00/)).toBeVisible()
    await share.fill('90')
    expect(onAmountChange).toHaveBeenLastCalledWith('c', { target: { value: '90' } })
    await expectNoAccessibilityViolations((await screen).container)
  })

  it('offers the quick fills, removing a contact and adding another', async () => {
    const { screen, onHalf, onEqually, onRemove, onAdd } = renderShares()
    const view = await screen

    await view.getByRole('button', { name: 'Metade' }).click()
    await view.getByRole('button', { name: 'Dividir igualmente' }).click()
    await view.getByRole('button', { name: 'Tirar Member C da divisão' }).click()
    await view.getByRole('button', { name: 'Adicionar contato' }).click()
    expect(onHalf).toHaveBeenCalledOnce()
    expect(onEqually).toHaveBeenCalledOnce()
    expect(onRemove).toHaveBeenCalledWith('c')
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('says what is wrong under the rows, shows a dash for your part and stops adding at the limit', async () => {
    const { screen } = renderShares({
      yoursCents: null,
      error: 'A soma das partes passa do valor total.',
      canAdd: false,
    })
    const view = await screen

    await expect.element(view.getByText('A soma das partes passa do valor total.')).toBeVisible()
    await expect.element(view.getByText('—')).toBeVisible()
    await expect.element(view.getByRole('button', { name: 'Adicionar contato' })).toBeDisabled()
    await expectNoAccessibilityViolations(view.container)
  })
})

describe('SharesCollapsed', () => {
  it('opens the shares', async () => {
    const onOpen = vi.fn()
    const screen = await render(<SharesCollapsed onOpen={onOpen} />)
    await screen.getByRole('button', { name: 'Dividir com contatos' }).click()
    expect(onOpen).toHaveBeenCalledOnce()
  })
})

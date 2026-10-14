import { Button } from '@web/components/actions/button'
import { Sheet } from '@web/components/layout/sheet/sheet'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function AnchoredSheet() {
  const [button, setButton] = useState<HTMLButtonElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button ref={setButton} type="button" onClick={() => setIsOpen(true)}>
        Dia do fechamento
      </button>
      <Sheet
        title="Escolha o dia"
        closeLabel="Fechar"
        anchor={button}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <p>1 2 3</p>
      </Sheet>
    </>
  )
}

function sheetBox() {
  return (document.querySelector('[data-slot=sheet]') as HTMLElement).getBoundingClientRect()
}

describe('Sheet', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('opens a titled dialog from the bottom on the phone and closes with Escape', async () => {
    await page.viewport(390, 844)
    const screen = await render(
      <Sheet title="Mais" trigger={<Button variant="outline">Mais</Button>}>
        <p>Contatos e cobranças</p>
      </Sheet>,
    )
    await screen.getByRole('button', { name: 'Mais' }).click()

    await expect.element(screen.getByRole('dialog', { name: 'Mais' })).toBeVisible()
    await expect.element(screen.getByText('Contatos e cobranças')).toBeVisible()
    await expectNoAccessibilityViolations(screen.getByRole('dialog', { name: 'Mais' }).element())
    await expect.poll(() => Math.round(sheetBox().bottom)).toBe(844)

    await userEvent.keyboard('{Escape}')
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens under the button that asked for it on the desktop, never along the bottom', async () => {
    await page.viewport(1440, 900)
    const screen = await render(<AnchoredSheet />)
    await screen.getByRole('button', { name: 'Dia do fechamento' }).click()

    await expect.element(screen.getByRole('dialog', { name: 'Escolha o dia' })).toBeVisible()
    const button = screen.getByRole('button', { name: 'Dia do fechamento' }).element()
    await expect.poll(() => sheetBox().top).toBeGreaterThan(button.getBoundingClientRect().bottom)
    expect(sheetBox().width).toBeLessThan(500)
    await screen.getByRole('button', { name: 'Fechar' }).click()
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens in the middle of the screen on the desktop when nothing anchors it', async () => {
    await page.viewport(1440, 900)
    const screen = await render(
      <Sheet title="Mover Feira para" trigger={<Button variant="outline">Mover</Button>}>
        <p>Nenhuma</p>
      </Sheet>,
    )
    await screen.getByRole('button', { name: 'Mover' }).click()

    await expect.element(screen.getByRole('dialog', { name: 'Mover Feira para' })).toBeVisible()
    await expect.poll(() => Math.abs(sheetBox().top + sheetBox().height / 2 - 450)).toBeLessThan(2)
    expect(sheetBox().width).toBeLessThan(500)
  })
})

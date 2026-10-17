import { ActionGrid } from '@web/components/actions/action-grid/action-grid'
import { Button } from '@web/components/actions/button'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const PHONE_HEIGHT_OF_PRIMARY = 48
const HEIGHT_OF_OTHERS = 44

function boxOf(screen: Awaited<ReturnType<typeof render>>, name: string) {
  return screen.getByRole('button', { name }).element().getBoundingClientRect()
}

function chargeActions(width: string) {
  return (
    <div className={width}>
      <ActionGrid label="Ações da cobrança">
        <Button>Registrar pagamento</Button>
        <Button variant="secondary">Enviar de novo</Button>
        <Button variant="secondary">Copiar Pix</Button>
      </ActionGrid>
    </div>
  )
}

describe('ActionGrid', () => {
  it('gives the primary the full width on the phone and the others one equal row below', async () => {
    const screen = await render(chargeActions('w-82'))

    const primary = boxOf(screen, 'Registrar pagamento')
    const resend = boxOf(screen, 'Enviar de novo')
    const pix = boxOf(screen, 'Copiar Pix')
    expect(primary.height).toBe(PHONE_HEIGHT_OF_PRIMARY)
    expect(primary.width).toBeGreaterThan(resend.width + pix.width)
    expect(resend.top).toBeGreaterThan(primary.bottom)
    expect(resend.top).toBe(pix.top)
    expect(resend.width).toBe(pix.width)
    expect(resend.height).toBe(HEIGHT_OF_OTHERS)
    expect(pix.height).toBe(HEIGHT_OF_OTHERS)
    await expect.element(screen.getByRole('group', { name: 'Ações da cobrança' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('puts every button in one row of equal cells on a wide container', async () => {
    const screen = await render(chargeActions('w-160'))

    const boxes = ['Registrar pagamento', 'Enviar de novo', 'Copiar Pix'].map((name) =>
      boxOf(screen, name),
    )
    for (const box of boxes) {
      expect(box.top).toBe(boxes[0]?.top)
      expect(box.width).toBe(boxes[0]?.width)
      expect(box.height).toBe(HEIGHT_OF_OTHERS)
    }
  })

  it('lets a lone last button take the whole row instead of leaving a hole', async () => {
    const screen = await render(
      <div className="w-82">
        <ActionGrid>
          <Button>Pagar fatura</Button>
          <Button variant="secondary">Ver lançamentos</Button>
        </ActionGrid>
        <ActionGrid layout="even">
          <Button variant="secondary">Copiar mensagem</Button>
          <Button variant="secondary">Copiar Pix</Button>
          <Button variant="secondary">Anexar comprovante</Button>
        </ActionGrid>
      </div>,
    )

    expect(boxOf(screen, 'Ver lançamentos').width).toBe(boxOf(screen, 'Pagar fatura').width)
    const message = boxOf(screen, 'Copiar mensagem')
    expect(boxOf(screen, 'Copiar Pix').top).toBe(message.top)
    expect(message.height).toBe(HEIGHT_OF_OTHERS)
    expect(boxOf(screen, 'Anexar comprovante').width).toBeGreaterThan(message.width * 2)
  })
})

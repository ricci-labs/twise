import { MessageBubble, shortPix } from '@web/components/finance/message-bubble/message-bubble'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const PIX = `00020126580014br.gov.bcb.pix0136a1b2${'0'.repeat(60)}6304E1F2`

const MESSAGE = ['Oi, Member D!', '• Mercado da semana — R$ 120,00', 'Pix copia e cola:', PIX].join(
  '\n',
)

describe('MessageBubble', () => {
  it('shows the stored message line by line, the Pix line shortened in mono', async () => {
    const screen = await render(<MessageBubble message={MESSAGE} pixPayload={PIX} />)

    const lines = screen.container.querySelectorAll('p')
    expect([...lines].map((line) => line.textContent)).toEqual([
      'Oi, Member D!',
      '• Mercado da semana — R$ 120,00',
      'Pix copia e cola:',
      '00020126580014br.gov.bcb.pix0136a1b2…6304E1F2',
    ])
    const pix = lines[3] as HTMLElement
    expect(getComputedStyle(pix).fontFamily).toContain('monospace')
    expect(getComputedStyle(lines[0] as HTMLElement).fontFamily).not.toContain('monospace')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('leaves every line in the body face when the charge has no Pix', async () => {
    const screen = await render(<MessageBubble message={MESSAGE} />)

    await expect.element(screen.getByText(PIX)).toBeVisible()
    expect(getComputedStyle(screen.getByText(PIX).element()).fontFamily).not.toContain('monospace')
  })

  it('keeps a long line inside a phone-wide bubble', async () => {
    const screen = await render(
      <div className="w-80">
        <MessageBubble message={`Oi, ${'Maria'.repeat(30)}!`} />
      </div>,
    )

    const bubble = screen.container.querySelector('[data-slot=message-bubble]') as HTMLElement
    expect(bubble.scrollWidth).toBeLessThanOrEqual(bubble.clientWidth)
  })
})

describe('shortPix', () => {
  it('keeps the start and the end of a long payload around an ellipsis', () => {
    expect(shortPix(PIX)).toBe('00020126580014br.gov.bcb.pix0136a1b2…6304E1F2')
  })

  it('leaves a short payload whole', () => {
    expect(shortPix('0002012658')).toBe('0002012658')
  })
})

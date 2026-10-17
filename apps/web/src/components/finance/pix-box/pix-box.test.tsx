import { PixBox } from '@web/components/finance/pix-box/pix-box'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const PIX = `00020126580014br.gov.bcb.pix0136a1b2${'0'.repeat(80)}6304E1F2`

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PixBox', () => {
  it('shows the amount and the whole code, and copies it for the toast', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    const onCopied = vi.fn()
    const screen = await render(<PixBox amountCents={20000} payload={PIX} onCopied={onCopied} />)

    await expect.element(screen.getByText('Pix copia e cola · R$ 200,00')).toBeVisible()
    await expect.element(screen.getByText(PIX)).toBeVisible()
    await screen.getByRole('button', { name: 'Copiar Pix' }).click()
    expect(writeText).toHaveBeenCalledWith(PIX)
    await vi.waitFor(() => expect(onCopied).toHaveBeenCalledOnce())
    await expectNoAccessibilityViolations(screen.container)
  })

  it('tells the screen when the copy fails', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))
    const onCopied = vi.fn()
    const onCopyFailed = vi.fn()
    const screen = await render(
      <PixBox amountCents={20000} payload={PIX} onCopied={onCopied} onCopyFailed={onCopyFailed} />,
    )

    await screen.getByRole('button', { name: 'Copiar Pix' }).click()
    await vi.waitFor(() => expect(onCopyFailed).toHaveBeenCalledOnce())
    expect(onCopied).not.toHaveBeenCalled()
  })

  it('wraps the code anywhere so it stays inside a phone-wide box', async () => {
    const screen = await render(
      <div className="w-80">
        <PixBox amountCents={125652000} payload={PIX} />
      </div>,
    )

    const code = screen.getByText(PIX).element()
    const box = screen.container.querySelector('[data-slot=pix-box]') as HTMLElement
    expect(code.getBoundingClientRect().right).toBeLessThanOrEqual(
      box.getBoundingClientRect().right,
    )
    expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth)
  })
})

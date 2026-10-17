import { EmailSendSheet } from '@web/components/finance/email-send-sheet/email-send-sheet'
import type { EmailSendSheetProps } from '@web/components/finance/email-send-sheet/email-send-sheet.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function sheet(props: Partial<EmailSendSheetProps> = {}) {
  return (
    <EmailSendSheet
      isOpen
      onOpenChange={() => undefined}
      to="member.d@exemplo.com"
      subject="Member A te enviou uma cobrança de R$ 200,00"
      replyTo={{ name: 'Member A', email: 'member.a@exemplo.com' }}
      hasPix
      onPreview={() => undefined}
      onSend={() => undefined}
      {...props}
    />
  )
}

function sheetBox() {
  return (document.querySelector('[data-slot=sheet]') as HTMLElement).getBoundingClientRect()
}

function factsOf(dialog: HTMLElement): string[][] {
  return [...dialog.querySelectorAll('dl > div')].map((row) => [
    row.querySelector('dt')?.textContent ?? '',
    row.querySelector('dd')?.textContent ?? '',
  ])
}

describe('EmailSendSheet', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('confirms who gets it, the subject and where replies go, then sends', async () => {
    await page.viewport(390, 844)
    const onSend = vi.fn()
    const onPreview = vi.fn()
    await render(sheet({ onSend, onPreview }))

    const dialog = page.getByRole('dialog', { name: 'Enviar por e-mail' })
    await expect.element(dialog).toBeVisible()
    expect(factsOf(dialog.element() as HTMLElement)).toEqual([
      ['Para', 'member.d@exemplo.com'],
      ['Assunto', 'Member A te enviou uma cobrança de R$ 200,00'],
      ['Respostas vão para', 'member.a@exemplo.com (Member A)'],
    ])
    await expect
      .element(
        dialog.getByText(
          'O e-mail leva a mensagem, o Pix copia e cola e um link para a pessoa pedir para não receber mais cobranças.',
        ),
      )
      .toBeVisible()
    await dialog.getByRole('button', { name: 'Ver o e-mail como ele chega' }).click()
    expect(onPreview).toHaveBeenCalledOnce()
    await dialog.getByRole('button', { name: 'Enviar e-mail' }).click()
    expect(onSend).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(dialog.element())
  })

  it('goes back by closing, and drops the Pix from the sentence when there is none', async () => {
    const onOpenChange = vi.fn()
    await render(sheet({ onOpenChange, hasPix: false }))

    await expect
      .element(
        page.getByText(
          'O e-mail leva a mensagem e um link para a pessoa pedir para não receber mais cobranças.',
        ),
      )
      .toBeVisible()
    await page.getByRole('button', { name: 'Voltar' }).click()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows the send in progress and does not send twice', async () => {
    const onSend = vi.fn()
    await render(sheet({ onSend, isSending: true }))

    const send = page.getByRole('button', { name: 'Enviando e-mail' })
    await expect.element(send).toHaveAttribute('aria-busy', 'true')
    const button = send.element() as HTMLElement
    button.click()
    expect(onSend).not.toHaveBeenCalled()
  })

  it('opens as a dialog in the middle of the screen on the desktop, not from the bottom', async () => {
    await page.viewport(1440, 900)
    await render(sheet())

    const dialog = page.getByRole('dialog', { name: 'Enviar por e-mail' })
    await expect.element(dialog).toBeVisible()
    await expect.poll(() => Math.abs(sheetBox().top + sheetBox().height / 2 - 450)).toBeLessThan(2)
    expect(sheetBox().width).toBeLessThan(500)
  })
})

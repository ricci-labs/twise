import { SendOptions } from '@web/components/finance/send-options/send-options'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const MESSAGE = 'Oi, Member D! Total: R$ 200,00'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SendOptions', () => {
  it('stacks WhatsApp, e-mail and copy, each saying where it goes and what happens', async () => {
    const onWhatsApp = vi.fn()
    const onEmail = vi.fn()
    const screen = await render(
      <SendOptions
        contactName="Member D"
        message={MESSAGE}
        whatsapp={{ phone: '+55 (11) 99999-0004', onSend: onWhatsApp }}
        email={{ address: 'member.d@exemplo.com', onSend: onEmail }}
      />,
    )

    const group = screen.getByRole('group', { name: 'Como enviar' })
    const buttons = group.getByRole('button').elements()
    expect(buttons.map((button) => button.textContent)).toEqual([
      'Enviar pelo WhatsApp+55 (11) 99999-0004 · abre o WhatsApp com a mensagem',
      'Enviar por e-mailmember.d@exemplo.com · o app envia e já marca como enviada',
      'Copiar mensagemPara mandar por onde preferir',
    ])
    await screen.getByRole('button', { name: /^Enviar pelo WhatsApp/ }).click()
    await screen.getByRole('button', { name: /^Enviar por e-mail/ }).click()
    expect(onWhatsApp).toHaveBeenCalledOnce()
    expect(onEmail).toHaveBeenCalledOnce()
    expect(buttons.every((button) => button.getBoundingClientRect().height >= 56)).toBe(true)
    await expect
      .element(screen.getByRole('button', { name: 'Adicionar WhatsApp ou e-mail' }))
      .not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('copies the message for the toast', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    const onCopied = vi.fn()
    const screen = await render(
      <SendOptions contactName="Member D" message={MESSAGE} onCopied={onCopied} />,
    )

    await screen.getByRole('button', { name: /^Copiar mensagem/ }).click()
    expect(writeText).toHaveBeenCalledWith(MESSAGE)
    await vi.waitFor(() => expect(onCopied).toHaveBeenCalledOnce())
  })

  it('keeps the e-mail visible but disabled, with the reason, for a contact who opted out', async () => {
    const onEmail = vi.fn()
    const screen = await render(
      <SendOptions
        contactName="Member E"
        message={MESSAGE}
        email={{ address: 'member.e@exemplo.com', isOptedOut: true, onSend: onEmail }}
      />,
    )

    const email = screen.getByRole('button', { name: /^Enviar por e-mail/ })
    await expect.element(email).toHaveAttribute('aria-disabled', 'true')
    expect(email.element().textContent).toBe(
      'Enviar por e-mailMember E pediu para não receber e-mails',
    )
    const button = email.element() as HTMLElement
    button.click()
    expect(onEmail).not.toHaveBeenCalled()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('leaves only copy and the way to add a channel when the contact has neither', async () => {
    const onAddChannel = vi.fn()
    const screen = await render(
      <SendOptions contactName="Member D" message={MESSAGE} onAddChannel={onAddChannel} />,
    )

    const group = screen.getByRole('group', { name: 'Como enviar' })
    expect(group.getByRole('button').elements()).toHaveLength(2)
    await expect.element(screen.getByRole('button', { name: /^Copiar mensagem/ })).toBeVisible()
    await screen.getByRole('button', { name: 'Adicionar WhatsApp ou e-mail' }).click()
    expect(onAddChannel).toHaveBeenCalledOnce()
  })

  it('breaks a long address inside the phone-wide option', async () => {
    const screen = await render(
      <div className="w-80">
        <SendOptions
          contactName="Member D"
          message={MESSAGE}
          email={{
            address: 'maria.aparecida.dos.santos.oliveira@exemplo.com',
            onSend: () => undefined,
          }}
        />
      </div>,
    )

    const option = screen.getByRole('button', { name: /^Enviar por e-mail/ }).element()
    expect(option.scrollWidth).toBeLessThanOrEqual(option.clientWidth)
  })
})

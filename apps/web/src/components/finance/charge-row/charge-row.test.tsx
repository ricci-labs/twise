import { CHARGE_STATUSES } from '@financas/shared'
import type { ItemAction } from '@web/components/actions/item-actions'
import { ChargeRow } from '@web/components/finance/charge-row/charge-row'
import type { ChargeRowProps } from '@web/components/finance/charge-row/charge-row.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const MENU: readonly ItemAction[] = [
  { key: 'message', label: 'Copiar mensagem', icon: 'list' },
  { key: 'cancel', label: 'Cancelar cobrança', icon: 'trash', tone: 'danger' },
]

function Charge({
  isOpenAtFirst = false,
  ...props
}: Partial<ChargeRowProps> & { isOpenAtFirst?: boolean }) {
  const [isOpen, setIsOpen] = useState(isOpenAtFirst)
  return (
    <ul>
      <ChargeRow
        createdOn="2026-10-20"
        amountCents={20000}
        status="sent"
        itemCount={2}
        sentVia="email"
        actions={MENU}
        {...props}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <p>Itens da cobrança</p>
      </ChargeRow>
    </ul>
  )
}

describe('ChargeRow', () => {
  it('opens in place from the whole header, and only then shows the ⋯', async () => {
    const screen = await render(<Charge />)
    const toggle = screen.getByRole('button', { name: /Cobrança de 20\/10/ })

    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect
      .element(toggle)
      .toHaveTextContent('Cobrança de 20/10R$ 200,00Enviada2 itens · e-mail')
    await expect.element(screen.getByText('Itens da cobrança')).not.toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Ações da cobrança de 20/10' }))
      .not.toBeInTheDocument()

    await toggle.click()

    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect.element(screen.getByText('Itens da cobrança')).toBeVisible()
    const menu = screen.getByRole('button', { name: 'Ações da cobrança de 20/10' })
    await expect.element(menu).toBeVisible()
    expect(toggle.element().contains(menu.element())).toBe(false)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('opens from the keyboard and reports the change', async () => {
    const onOpenChange = vi.fn()
    const screen = await render(
      <ul>
        <ChargeRow
          createdOn="2026-10-20"
          amountCents={20000}
          status="draft"
          itemCount={1}
          isOpen={false}
          onOpenChange={onOpenChange}
        />
      </ul>,
    )
    const toggle = screen.getByRole('button', { name: /Cobrança de 20\/10/ })

    await userEvent.tab()
    await expect.element(toggle).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything())
  })

  it('names each status and says when the e-mail did not leave', async () => {
    const screen = await render(
      <ul>
        {CHARGE_STATUSES.map((status) => (
          <ChargeRow
            key={status}
            createdOn="2026-10-20"
            amountCents={20000}
            status={status}
            itemCount={1}
            sentVia="whatsapp"
            hasEmailFailed={status === 'draft'}
            isOpen={false}
            onOpenChange={() => undefined}
          />
        ))}
      </ul>,
    )

    const names = screen
      .getByRole('button')
      .elements()
      .map((button) => button.textContent)
    expect(names).toEqual([
      'Cobrança de 20/10R$\u00a0200,00Rascunho1 item · e-mail não saiu',
      'Cobrança de 20/10R$\u00a0200,00Enviada1 item · WhatsApp',
      'Cobrança de 20/10R$\u00a0200,00Paga em parte1 item · WhatsApp',
      'Cobrança de 20/10R$\u00a0200,00Paga1 item · WhatsApp',
      'Cobrança de 20/10R$\u00a0200,00Cancelada1 item · WhatsApp',
    ])
    const [draft, sent, partial, paid, cancelled] = [
      ...screen.container.querySelectorAll('[data-slot=badge]'),
    ].map((badge) => getComputedStyle(badge).backgroundColor)
    expect(cancelled).toBe(draft)
    expect(new Set([draft, sent, partial, paid]).size).toBe(4)
  })

  it('keeps a long amount whole and cuts the title on a phone', async () => {
    const screen = await render(
      <div className="w-80">
        <Charge amountCents={125652000} itemCount={12} hasEmailFailed isOpenAtFirst />
      </div>,
    )
    const amount = screen.getByText('R$ 1.256.520,00').element()
    const toggle = screen.getByRole('button', { name: /Cobrança de 20\/10/ }).element()

    expect(amount.getBoundingClientRect().height).toBeLessThan(24)
    expect(toggle.scrollWidth).toBeLessThanOrEqual(toggle.clientWidth)
    await expect
      .element(screen.getByRole('button', { name: 'Ações da cobrança de 20/10' }))
      .toBeVisible()
  })
})

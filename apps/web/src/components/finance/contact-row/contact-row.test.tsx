import { ContactRow } from '@web/components/finance/contact-row/contact-row'
import type {
  ContactRowLinkProps,
  ContactRowProps,
} from '@web/components/finance/contact-row/contact-row.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const LONG_NAME = 'Maria Aparecida dos Santos Oliveira'

const MEMBER_D: ContactRowProps = {
  name: 'Member D',
  owedCents: 52000,
  overdueCents: 20000,
  overdueSince: '2026-10-10',
  channels: ['whatsapp', 'email'],
}

function OpenButton({ onOpen, ...props }: ContactRowLinkProps & { onOpen?: () => void }) {
  return <button type="button" onClick={onOpen} {...props} />
}

function inList(props: Partial<ContactRowProps>, onOpen?: () => void) {
  return render(
    <div className="w-90">
      <ul>
        <ContactRow {...MEMBER_D} link={<OpenButton onOpen={onOpen} />} {...props} />
      </ul>
    </div>,
  )
}

function stateLine(element: Element) {
  return element.closest('[data-slot=badge]')?.parentElement ?? element
}

describe('ContactRow', () => {
  it('starts the second line with "Em atraso", then what is overdue and since when', async () => {
    const screen = await inList({})
    const badge = screen.getByText('Em atraso').element()
    const line = stateLine(badge)
    expect(line.firstElementChild).toBe(badge)
    expect(line.textContent).toBe('Em atrasoR$ 200,00 vencido desde 10/10')
    await expect.element(screen.getByText('WhatsApp')).toBeVisible()
    await expect.element(screen.getByText('E-mail')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows what is owed in danger with "deve", read with the row', async () => {
    const screen = await inList({})
    const amount = screen.getByText('R$ 520,00').element()
    const danger = getComputedStyle(amount).color
    const link = screen.getByRole('button', { name: /Member D/ }).element()
    const balance = document.getElementById(link.getAttribute('aria-describedby') ?? '')
    expect(balance?.textContent).toBe('R$ 520,00deve')
    const plain = await inList({ owedCents: 51000, overdueCents: 0, overdueSince: null })
    const plainAmount = plain.getByText('R$ 510,00').element()
    expect(getComputedStyle(plainAmount).color).not.toBe(danger)
  })

  it('opens the contact anywhere on the row, the amount included', async () => {
    const onOpen = vi.fn()
    const screen = await inList({}, onOpen)
    const amount = screen.getByText('R$ 520,00').element().getBoundingClientRect()
    const hit = document.elementFromPoint(
      amount.left + amount.width / 2,
      amount.top + amount.height / 2,
    )
    const link = screen.getByRole('button', { name: /Member D/ }).element()
    expect(hit).toBe(link)
    await screen.getByRole('button', { name: /Member D/ }).click()
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('offers "Cobrar" as its own button under the amount', async () => {
    const onOpen = vi.fn()
    const onCharge = vi.fn()
    const screen = await render(
      <ul>
        <ContactRow {...MEMBER_D} link={<OpenButton onOpen={onOpen} />} onCharge={onCharge} />
      </ul>,
    )
    const charge = screen.getByRole('button', { name: 'Cobrar Member D' })
    await charge.click()
    expect(onCharge).toHaveBeenCalledOnce()
    expect(onOpen).not.toHaveBeenCalled()
    const amount = screen.getByText('R$ 520,00').element().getBoundingClientRect()
    expect(charge.element().getBoundingClientRect().top).toBeGreaterThan(amount.bottom)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('says "Cobrado em 20/10" once the overdue amount is in a charge', async () => {
    const screen = await inList({ chargedOn: '2026-10-20' })
    await expect.element(screen.getByText('Cobrado em 20/10')).toBeVisible()
    await expect.element(screen.getByText('Em atraso')).not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('puts the opt-out badge before the next due amount', async () => {
    const screen = await inList({
      overdueCents: 0,
      overdueSince: null,
      nextDueOn: '2026-11-10',
      nextDueCents: 20000,
      isOptedOut: true,
    })
    const line = stateLine(screen.getByText('Não quer mensagens').element())
    expect(line.textContent).toBe('Não quer mensagensPróximo: R$ 200,00 em 10/11')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows a credit in mint, and a settled contact as "em dia"', async () => {
    const credit = await inList({ owedCents: -3000, overdueCents: 0, overdueSince: null })
    await expect.element(credit.getByText('Tem crédito de R$ 30,00')).toBeVisible()
    await expect.element(credit.getByText('crédito', { exact: true })).toBeVisible()
    const creditColor = getComputedStyle(
      credit.getByText('R$ 30,00', { exact: true }).element(),
    ).color
    await expectNoAccessibilityViolations(credit.container)
    const settled = await inList({ owedCents: 0, overdueCents: 0, overdueSince: null })
    await expect.element(settled.getByText('Em dia', { exact: true })).toBeVisible()
    await expect.element(settled.getByText('em dia', { exact: true })).toBeVisible()
    const settledColor = getComputedStyle(settled.getByText('R$ 0,00').element()).color
    expect(settledColor).not.toBe(creditColor)
  })

  it('dims an archived contact and keeps its text readable', async () => {
    const active = await inList({ name: 'Member H', owedCents: 0, overdueCents: 0 })
    const activeColor = getComputedStyle(active.getByText('Member H').element()).color
    const screen = await inList({
      name: 'Member G',
      owedCents: 0,
      overdueCents: 0,
      isArchived: true,
    })
    const name = screen.getByText('Member G').element()
    expect(getComputedStyle(name).color).not.toBe(activeColor)
    const avatar = screen.container.querySelector('[data-slot=avatar]') as HTMLElement
    expect(Number(getComputedStyle(avatar).opacity)).toBeLessThan(1)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps a 7-digit amount on one line beside a long name at 360 px', async () => {
    const screen = await inList({
      name: LONG_NAME,
      owedCents: 125652000,
      overdueCents: 125652000,
      isOptedOut: true,
      onCharge: vi.fn(),
    })
    const amount = screen.getByText('R$ 1.256.520,00', { exact: true }).element()
    const row = screen.getByRole('listitem').element()
    expect(amount.getBoundingClientRect().height).toBeLessThan(24)
    expect(amount.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right,
    )
    const name = screen.getByText(LONG_NAME).element()
    const lineHeight = Number.parseFloat(getComputedStyle(name).lineHeight)
    expect(name.getBoundingClientRect().height).toBeLessThanOrEqual(lineHeight * 2 + 1)
    const line = stateLine(screen.getByText('Em atraso').element())
    const detailLine = Number.parseFloat(getComputedStyle(line).lineHeight)
    expect(line.getBoundingClientRect().height).toBeLessThan(detailLine * 3)
  })
})

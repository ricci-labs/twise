import { OpenItemRow } from '@web/components/finance/open-item-row/open-item-row'
import type {
  OpenItemRowLinkProps,
  OpenItemRowProps,
} from '@web/components/finance/open-item-row/open-item-row.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const GROCERIES: OpenItemRowProps = {
  dueOn: '2026-10-10',
  description: 'Mercado da semana',
  detail: 'Cartão X · metade de R$ 240,00',
  amountCents: 12000,
}

function inList(props: Partial<OpenItemRowProps>) {
  return render(
    <div className="w-90">
      <ul>
        <OpenItemRow {...GROCERIES} {...props} />
      </ul>
    </div>,
  )
}

function detailOf(badge: Element) {
  return badge.closest('[data-slot=badge]')?.parentElement as HTMLElement
}

describe('OpenItemRow', () => {
  it('shows the date block, the description, the detail and the amount, the date read first', async () => {
    const screen = await inList({})
    await expect.element(screen.getByText('Mercado da semana')).toBeVisible()
    await expect.element(screen.getByText('Cartão X · metade de R$ 240,00')).toBeVisible()
    await expect.element(screen.getByText('R$ 120,00', { exact: true })).toBeVisible()
    const row = screen.getByRole('listitem').element()
    expect(row.textContent?.startsWith('10out10 de outubro: Mercado da semana')).toBe(true)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('starts the second line with "Atrasado" and tints the date when overdue', async () => {
    const screen = await inList({ isOverdue: true })
    const badge = screen.getByText('Atrasado').element()
    const detail = detailOf(badge)
    expect(detail.firstElementChild).toBe(badge)
    expect(detail.textContent).toBe('AtrasadoCartão X · metade de R$ 240,00')
    const block = screen.container.querySelector('[data-slot=date-block]') as HTMLElement
    const plain = await inList({ description: 'TV da sala' })
    const plainBlock = plain.container.querySelector('[data-slot=date-block]') as HTMLElement
    expect(getComputedStyle(block).backgroundColor).not.toBe(
      getComputedStyle(plainBlock).backgroundColor,
    )
    await expectNoAccessibilityViolations(screen.container)
  })

  it('says "Na cobrança de 20/10" in place of "Atrasado" once it is in a charge', async () => {
    const screen = await inList({ isOverdue: true, chargedOn: '2026-10-20' })
    const badge = screen.getByText('Na cobrança de 20/10').element()
    expect(detailOf(badge).firstElementChild).toBe(badge)
    await expect.element(screen.getByText('Atrasado')).not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('opens through the link element that wraps the row', async () => {
    const onOpen = vi.fn()
    function OpenButton(props: OpenItemRowLinkProps) {
      return <button type="button" onClick={onOpen} {...props} />
    }
    const screen = await render(
      <ul>
        <OpenItemRow {...GROCERIES} link={<OpenButton />} />
      </ul>,
    )
    await screen.getByRole('button', { name: /Mercado da semana/ }).click()
    expect(onOpen).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps R$ 1.256.520,00 on one line beside long text at 360 px', async () => {
    const long = 'Reforma da cozinha e do banheiro da casa da praia com Maria Aparecida dos Santos '
    const screen = await inList({
      description: long.repeat(2).trim(),
      detail: long.repeat(2).trim(),
      amountCents: 125652000,
      isOverdue: true,
      chargedOn: '2026-10-20',
    })
    const amount = screen.getByText('R$ 1.256.520,00').element()
    const row = screen.getByRole('listitem').element()
    expect(amount.getBoundingClientRect().height).toBeLessThan(24)
    expect(amount.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right,
    )
    const title = screen.getByText(long.repeat(2).trim(), { exact: true }).first().element()
    const lineHeight = Number.parseFloat(getComputedStyle(title).lineHeight)
    expect(title.getBoundingClientRect().height).toBeLessThanOrEqual(lineHeight * 2 + 1)
  })
})

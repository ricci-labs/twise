import { EntryRow } from '@web/components/finance/entry-row/entry-row'
import type {
  EntryRowLinkProps,
  EntryRowProps,
} from '@web/components/finance/entry-row/entry-row.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  expectClampedToTwoLines,
  expectWholeAmount,
  LONG_TEXT,
  supportLineOf,
} from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

function DetailLink({ className, children }: EntryRowLinkProps) {
  return (
    <a href="#detalhe" className={className}>
      {children}
    </a>
  )
}

const MARKET: EntryRowProps = {
  description: 'Mercado da semana',
  detail: 'Mercado › Feira · Conta X',
  art: { name: 'Mercado', icon: 'groceries' },
  amountCents: 8640,
  direction: 'out',
}

function inList(props: Partial<EntryRowProps>) {
  return render(
    <ul>
      <EntryRow {...MARKET} {...props} />
    </ul>,
  )
}

describe('EntryRow', () => {
  it('shows money out with "−", money in with "+" and a transfer with no sign', async () => {
    const out = await inList({})
    await expect.element(out.getByText('−R$ 86,40')).toBeVisible()
    await expect.element(out.getByText('Mercado › Feira · Conta X')).toBeVisible()

    const income = await inList({ amountCents: 12000, direction: 'in' })
    await expect.element(income.getByText('+R$ 120,00')).toBeVisible()

    const transfer = await inList({ amountCents: 60000, direction: 'neutral' })
    await expect.element(transfer.getByText('R$ 600,00', { exact: true })).toBeVisible()
    await expectNoAccessibilityViolations(out.container)
  })

  it('names its installments, its contacts and its receipt', async () => {
    const screen = await inList({ installmentCount: 3, isShared: true, hasReceipt: true })

    await expect.element(screen.getByText('3×')).toBeVisible()
    await expect.element(screen.getByText('em 3 parcelas')).toBeInTheDocument()
    await expect.element(screen.getByRole('img', { name: 'Dividido com contatos' })).toBeVisible()
    await expect.element(screen.getByRole('img', { name: 'Tem comprovante' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows no badge for a single payment', async () => {
    const screen = await inList({})
    await expect.element(screen.getByText('1×')).not.toBeInTheDocument()
  })

  it('marks the searched part of the description, ignoring accents', async () => {
    const screen = await inList({ description: 'Pão da manhã', search: 'pao' })
    const marked = screen.container.querySelector('mark')

    expect(marked?.textContent).toBe('Pão')
  })

  it('opens what its link points to with the whole row', async () => {
    const screen = await inList({ link: <DetailLink /> })
    const link = screen.getByRole('link', { name: /Mercado da semana/ })

    await expect.element(link).toHaveAttribute('href', '#detalhe')
    await expect.poll(() => link.element().textContent).toMatch(/−R\$\s86,40/)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('cuts a long description and detail at two lines and keeps the amount whole', async () => {
    const screen = await render(
      <ul className="w-80">
        <EntryRow
          {...MARKET}
          description={LONG_TEXT.description}
          detail={`${LONG_TEXT.account} · por ${LONG_TEXT.person}`}
          amountCents={LONG_TEXT.amountCents}
        />
      </ul>,
    )
    const row = screen.container.querySelector('[data-slot=entry-row]') as HTMLElement

    expectClampedToTwoLines(screen.getByText(LONG_TEXT.description).element())
    expectClampedToTwoLines(supportLineOf(row))
    expectWholeAmount(row.querySelector('[data-slot=amount]') as HTMLElement, row)
  })
})

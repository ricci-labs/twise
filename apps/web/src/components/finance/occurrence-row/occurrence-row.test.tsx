import { OccurrenceRow } from '@web/components/finance/occurrence-row/occurrence-row'
import type {
  OccurrenceRowLinkProps,
  OccurrenceRowProps,
} from '@web/components/finance/occurrence-row/occurrence-row.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

function ActionsButton({ className, children }: OccurrenceRowLinkProps) {
  return (
    <button type="button" className={className}>
      {children}
    </button>
  )
}

const INTERNET: OccurrenceRowProps = {
  dueOn: '2026-10-18',
  description: 'Internet',
  detail: 'Conta X · Casa › Internet',
  amountCents: 12000,
  direction: 'out',
}

function inList(props: Partial<OccurrenceRowProps>) {
  return render(
    <ul>
      <OccurrenceRow {...INTERNET} link={<ActionsButton />} {...props} />
    </ul>,
  )
}

describe('OccurrenceRow', () => {
  it('shows the day and month, the name, the second line and the amount with no sign', async () => {
    const screen = await inList({})
    await expect.element(screen.getByText('18', { exact: true })).toBeVisible()
    await expect.element(screen.getByText('out', { exact: true })).toBeVisible()
    await expect.element(screen.getByText('Conta X · Casa › Internet')).toBeVisible()
    await expect.element(screen.getByText('R$ 120,00', { exact: true })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps its text at the start when the row is a button', async () => {
    const screen = await inList({})
    const button = screen.getByRole('button').element()
    expect(getComputedStyle(button).textAlign).toBe('start')
  })

  it('starts the second line with the status badge', async () => {
    const screen = await inList({ badge: 'overdue', isOverdue: true })
    const badge = screen.getByText('Atrasado').element()
    const detail = badge.parentElement
    expect(detail?.firstElementChild).toBe(badge)
    expect(detail?.textContent).toBe('AtrasadoConta X · Casa › Internet')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('reads an estimate as approximate', async () => {
    const screen = await inList({ isEstimate: true })
    const estimate = screen.getByTitle('Valor aproximado')
    await expect.element(estimate).toBeVisible()
    expect(estimate.element().textContent?.startsWith('≈')).toBe(true)
  })

  it('offers the compact "Registrar" beside the amount, apart from the row', async () => {
    const onPress = vi.fn()
    const screen = await inList({
      badge: 'overdue',
      isOverdue: true,
      register: { label: 'Registrar pagamento de Internet', onPress },
    })
    await screen.getByRole('button', { name: 'Registrar pagamento de Internet' }).click()
    expect(onPress).toHaveBeenCalledOnce()
    await expect.element(screen.getByText('R$ 120,00', { exact: true })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps a 7-digit amount on one line beside a long name', async () => {
    const screen = await render(
      <div className="w-90">
        <ul>
          <OccurrenceRow
            {...INTERNET}
            description="Internet fibra 1 giga com TV e telefone da casa da praia e do escritório"
            amountCents={123456789}
          />
        </ul>
      </div>,
    )
    const amount = screen.getByText('R$ 1.234.567,89').element()
    const column = amount.parentElement as HTMLElement
    const row = screen.getByRole('listitem').element()
    expect(amount.getBoundingClientRect().height).toBeLessThan(24)
    expect(column.scrollWidth).toBeLessThanOrEqual(column.clientWidth)
    expect(amount.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right,
    )
  })

  it('cuts the name and the second line after two lines each', async () => {
    const long = 'Internet fibra 1 giga com TV e telefone da casa da praia e do escritório '.repeat(
      3,
    )
    const screen = await render(
      <div className="w-90">
        <ul>
          <OccurrenceRow {...INTERNET} description={long} detail={long} />
        </ul>
      </div>,
    )
    for (const text of screen.getByText(long.trim()).elements()) {
      const lineHeight = Number.parseFloat(getComputedStyle(text).lineHeight)
      expect(text.getBoundingClientRect().height).toBeLessThanOrEqual(lineHeight * 2 + 1)
    }
  })

  it('mutes a received income like any other done row', async () => {
    const pending = await inList({ direction: 'in' })
    const pendingColor = getComputedStyle(pending.getByText('R$ 120,00').element()).color
    const done = await inList({
      direction: 'in',
      isDone: true,
      badge: 'received',
      amountCents: 280000,
    })
    const doneColor = getComputedStyle(done.getByText('R$ 2.800,00').element()).color
    expect(doneColor).not.toBe(pendingColor)
  })
})

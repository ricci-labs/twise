import { RecurrenceRow } from '@web/components/finance/recurrence-row/recurrence-row'
import type { RecurrenceRowProps } from '@web/components/finance/recurrence-row/recurrence-row.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const RENT: RecurrenceRowProps = {
  description: 'Aluguel',
  detail: 'Todo dia 5 · Conta X · Casa › Aluguel',
  next: { label: 'Próxima 05/11', tone: 'neutral' },
  art: { name: 'Casa', icon: 'home' },
  amountCents: 210000,
  direction: 'out',
}

function inList(props: Partial<RecurrenceRowProps>) {
  return render(
    <div className="w-90">
      <ul>
        <RecurrenceRow {...RENT} {...props} />
      </ul>
    </div>,
  )
}

describe('RecurrenceRow', () => {
  it('shows how it repeats, the next date and the amount with no sign', async () => {
    const screen = await inList({})
    await expect.element(screen.getByText('Todo dia 5 · Conta X · Casa › Aluguel')).toBeVisible()
    await expect.element(screen.getByText('Próxima 05/11')).toBeVisible()
    await expect.element(screen.getByText('R$ 2.100,00', { exact: true })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('puts an overdue next date in danger and a due-today one in warning', async () => {
    const overdue = await inList({ next: { label: 'Atrasada desde 18/10', tone: 'overdue' } })
    const late = getComputedStyle(overdue.getByText('Atrasada desde 18/10').element()).color
    const today = await inList({ next: { label: 'Vence hoje', tone: 'today' } })
    const due = getComputedStyle(today.getByText('Vence hoje').element()).color
    const neutral = await inList({})
    const plain = getComputedStyle(neutral.getByText('Próxima 05/11').element()).color
    expect(new Set([late, due, plain]).size).toBe(3)
    await expectNoAccessibilityViolations(overdue.container)
  })

  it('keeps a 7-digit estimate whole beside a long name', async () => {
    const screen = await inList({
      description: 'Internet fibra 1 giga com TV e telefone da casa da praia e do escritório',
      amountCents: 123456789,
      isEstimate: true,
    })
    const amount = screen.getByText('R$ 1.234.567,89').element()
    const row = screen.getByRole('listitem').element()
    expect(amount.getBoundingClientRect().height).toBeLessThan(24)
    expect(amount.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right,
    )
    await expect.element(screen.getByTitle('Valor aproximado')).toBeVisible()
  })
})

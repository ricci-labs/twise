import { AccountRow } from '@web/components/finance/account-row/account-row'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  expectClampedToTwoLines,
  expectWholeAmount,
  LONG_TEXT,
  supportLineOf,
} from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const ROW_HEIGHT = 61

describe('AccountRow', () => {
  it('reads the name, the balance and the kind as one link, with the actions apart', async () => {
    const screen = await render(
      <ul className="w-90 rounded-lg border border-border bg-surface px-3 py-1">
        <AccountRow
          name="Conta X"
          icon="wallet"
          color={null}
          detail="Conta corrente · Member A"
          amountCents={420000}
          link={<a href="#conta-x" />}
          actions={<button type="button">Ações de Conta X</button>}
        />
        <AccountRow
          name="Conta Y"
          icon="wallet"
          color={null}
          detail="Conta corrente · Member B"
          amountCents={280000}
        />
      </ul>,
    )
    const link = screen.getByRole('link')

    expect(link.element().textContent).toMatch(/Conta XR\$\s4\.200,00Conta corrente · Member A/)
    await expect.element(screen.getByRole('button', { name: 'Ações de Conta X' })).toBeVisible()
    const rows = screen.container.querySelectorAll('[data-slot=account-row]')
    expect(Math.round((rows[1] as HTMLElement).getBoundingClientRect().height)).toBe(ROW_HEIGHT)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('fades an archived account and leaves the balance out when there is none', async () => {
    const screen = await render(
      <ul>
        <AccountRow name="Feira" icon={null} color={null} detail="Subcategoria" isArchived />
      </ul>,
    )
    const main = screen.container.querySelector('[data-slot=account-row] > div') as HTMLElement

    expect(getComputedStyle(main).opacity).toBe('0.7')
    expect(main.textContent).toBe('FFeiraSubcategoria')
  })

  it('cuts a long name and detail at two lines and keeps the balance whole', async () => {
    const screen = await render(
      <ul className="w-80">
        <AccountRow
          name={`${LONG_TEXT.account} ${LONG_TEXT.description}`}
          icon="wallet"
          color={null}
          detail={`Conta corrente · ${LONG_TEXT.person} · ${LONG_TEXT.account} · ${LONG_TEXT.person}`}
          amountCents={LONG_TEXT.amountCents}
        />
      </ul>,
    )
    const row = screen.container.querySelector('[data-slot=account-row]') as HTMLElement

    expectClampedToTwoLines(screen.getByText(LONG_TEXT.description, { exact: false }).element())
    expectClampedToTwoLines(supportLineOf(row))
    expectWholeAmount(row.querySelector('[data-slot=amount]') as HTMLElement, row)
  })
})

import {
  DataTable,
  DataTableAmount,
  DataTableName,
} from '@web/components/display/data-table/data-table'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { expectClampedToTwoLines, expectWholeAmount, LONG_TEXT } from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('DataTable', () => {
  it('lays rows under their column headers, names linked and amounts at the end', async () => {
    const screen = await render(
      <DataTable
        label="Dinheiro"
        layout="accounts"
        columns={[
          { key: 'name', label: 'Conta' },
          { key: 'kind', label: 'Tipo' },
          { key: 'owner', label: 'De quem' },
          { key: 'balance', label: 'Saldo hoje', align: 'end' },
          { key: 'actions', label: 'Ações', isLabelHidden: true },
        ]}
        rows={[
          {
            key: 'x',
            cells: [
              <DataTableName key="name" name="Conta X" icon="wallet" link={<a href="#x">x</a>} />,
              'Conta corrente',
              'Member A',
              <DataTableAmount key="balance" cents={420000} />,
              null,
            ],
          },
        ]}
      />,
    )

    await expect.element(screen.getByRole('table', { name: 'Dinheiro' })).toBeVisible()
    await expect.element(screen.getByRole('columnheader', { name: 'Saldo hoje' })).toBeVisible()
    await expect
      .element(screen.getByRole('link', { name: 'Conta X' }))
      .toHaveAttribute('href', '#x')
    await expect.element(screen.getByRole('cell', { name: 'R$ 4.200,00' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('gives a long name two lines, other cells one line with "…", and keeps the amount whole', async () => {
    const screen = await render(
      <div className="w-160">
        <DataTable
          label="Dinheiro"
          layout="accounts"
          columns={[
            { key: 'name', label: 'Conta' },
            { key: 'kind', label: 'Tipo' },
            { key: 'owner', label: 'De quem' },
            { key: 'balance', label: 'Saldo hoje', align: 'end' },
            { key: 'actions', label: 'Ações', isLabelHidden: true },
          ]}
          rows={[
            {
              key: 'joint',
              cells: [
                <DataTableName
                  key="name"
                  name={`${LONG_TEXT.account} ${LONG_TEXT.description}`}
                  icon="wallet"
                />,
                'Conta corrente conjunta',
                LONG_TEXT.person,
                <DataTableAmount key="balance" cents={LONG_TEXT.amountCents} />,
                null,
              ],
            },
          ]}
        />
      </div>,
    )
    const row = screen.getByRole('row').nth(1).element()
    const owner = screen.getByRole('cell', { name: LONG_TEXT.person }).element()

    expectClampedToTwoLines(screen.getByText(LONG_TEXT.description, { exact: false }).element())
    expect(getComputedStyle(owner).textOverflow).toBe('ellipsis')
    expect(owner.scrollWidth).toBeGreaterThan(owner.clientWidth)
    expectWholeAmount(row.querySelector('[data-slot=amount]') as HTMLElement, row)
  })
})

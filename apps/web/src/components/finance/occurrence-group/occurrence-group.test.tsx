import { OccurrenceGroup } from '@web/components/finance/occurrence-group/occurrence-group'
import { OccurrenceRow } from '@web/components/finance/occurrence-row'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

function internet() {
  return (
    <OccurrenceRow
      dueOn="2026-10-18"
      description="Internet"
      detail="Conta X · Casa › Internet"
      amountCents={12000}
      direction="out"
    />
  )
}

describe('OccurrenceGroup', () => {
  it('is a region named by its heading, with the count read in words', async () => {
    const screen = await render(
      <OccurrenceGroup title="A vencer" count={4}>
        {internet()}
      </OccurrenceGroup>,
    )
    await expect.element(screen.getByRole('region', { name: 'A vencer 4 itens' })).toBeVisible()
    await expect.element(screen.getByRole('listitem')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('puts the add link with its plus at the end of the heading', async () => {
    const pressed: string[] = []
    const screen = await render(
      <OccurrenceGroup
        title="Receitas"
        count={1}
        add={{ label: 'Nova receita', onPress: () => pressed.push('add') }}
      >
        {internet()}
      </OccurrenceGroup>,
    )
    await screen.getByRole('button', { name: 'Nova receita' }).click()
    expect(pressed).toEqual(['add'])
    await expectNoAccessibilityViolations(screen.container)
  })

  it('draws the overdue group in danger, with the larger padding', async () => {
    const screen = await render(
      <OccurrenceGroup title="Atrasados" count={1} tone="danger" footer={<p>rodapé</p>}>
        {internet()}
      </OccurrenceGroup>,
    )
    const list = screen.getByRole('list').element()
    expect(getComputedStyle(list).paddingLeft).toBe('16px')
    await expect.element(screen.getByText('rodapé')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})

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

  it('puts the note under the heading and the empty sentence in place of the list', async () => {
    const screen = await render(
      <OccurrenceGroup
        title="Do espaço"
        count={0}
        note="Só os do espaço."
        empty="Nenhum feriado do espaço."
      />,
    )
    await expect.element(screen.getByText('Só os do espaço.')).toBeVisible()
    await expect.element(screen.getByText('Nenhum feriado do espaço.')).toBeVisible()
    await expect.element(screen.getByRole('list')).not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('names a sub-group with a small caps label and no count', async () => {
    const screen = await render(
      <OccurrenceGroup title="Vencidos" heading="label">
        {internet()}
      </OccurrenceGroup>,
    )
    const heading = screen.getByRole('heading', { name: 'Vencidos', level: 3 })
    await expect.element(heading).toBeVisible()
    expect(getComputedStyle(heading.element()).textTransform).toBe('uppercase')
    await expect.element(screen.getByRole('region', { name: 'Vencidos' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})

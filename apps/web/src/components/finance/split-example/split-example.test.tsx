import { SplitExample } from '@web/components/finance/split-example/split-example'
import type {
  SplitExamplePart,
  SplitExampleProps,
} from '@web/components/finance/split-example/split-example.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { expectClampedToTwoLines, expectWholeAmount } from '@web/testing/long-text'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const PARTS: readonly SplitExamplePart[] = [
  { position: 1, label: 'Poupança (reserva)', amountCents: 60000 },
  { position: 2, label: 'Troca do carro (pulado)', amountCents: null },
  { position: 3, label: 'Conta X (o que sobrou)', amountCents: 90000 },
]

const BASE: SplitExampleProps = {
  choice: 'current',
  onChoiceChange: () => {},
  customAmount: '',
  onCustomAmountChange: () => {},
  amountCents: 150000,
  parts: PARTS,
  leftoverCents: 0,
}

function renderExample(props: Partial<SplitExampleProps>) {
  return render(
    <div className="w-90">
      <SplitExample {...BASE} {...props} />
    </div>,
  )
}

describe('SplitExample', () => {
  it('shows the amount, one row per step and what is left without a destination', async () => {
    const screen = await renderExample({})
    await expect.element(screen.getByRole('region', { name: 'Como ficaria' })).toBeVisible()
    await expect.element(screen.getByText(/\(esta comissão\):/)).toBeVisible()
    await expect.element(screen.getByText('R$ 1.500,00')).toBeVisible()
    await expect.element(screen.getByText('R$ 600,00')).toBeVisible()
    await expect.element(screen.getByText('Sem destino')).toBeVisible()
    await expect.element(screen.getByText('R$ 0,00')).toBeVisible()
    await expect.element(screen.getByText(/Nada se move sozinho/)).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows a dash for a skipped step and reads it as no amount', async () => {
    const screen = await renderExample({})
    const skipped = screen.getByRole('listitem').nth(1)
    expect(skipped.element().textContent).toContain('—')
    await expect.element(skipped.getByText('nenhum valor')).toBeInTheDocument()
  })

  it('tells which example amount was picked', async () => {
    const onChoiceChange = vi.fn()
    const screen = await renderExample({ onChoiceChange })
    const current = screen.getByRole('radio', { name: 'Esta comissão' })
    await expect.element(current).toHaveAttribute('aria-checked', 'true')
    await screen.getByRole('radio', { name: 'Média' }).click()
    expect(onChoiceChange).toHaveBeenCalledWith('average')
  })

  it('opens a money field for "Outro valor" and hands back what is typed', async () => {
    const onCustomAmountChange = vi.fn()
    const screen = await renderExample({ choice: 'custom', onCustomAmountChange })
    await expect.element(screen.getByText(/\(outro valor\):/)).toBeVisible()
    await screen.getByRole('textbox', { name: 'Outro valor' }).fill('2000')
    expect(onCustomAmountChange).toHaveBeenLastCalledWith('2000')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('has no money field for the other choices', async () => {
    const screen = await renderExample({ choice: 'average' })
    expect(screen.getByRole('textbox').elements()).toHaveLength(0)
  })

  it('offers only the choices it is given', async () => {
    const screen = await renderExample({ choices: ['current', 'custom'] })
    expect(screen.getByRole('radio').elements()).toHaveLength(2)
  })

  it('draws the bar with one coloured part per step and the numbers in the same colours', async () => {
    const screen = await renderExample({ hasBar: true, leftoverCents: 10000 })
    const segments = screen.container.querySelectorAll('rect')
    expect(segments).toHaveLength(3)
    const [first] = segments
    const number = screen.getByText('1', { exact: true }).element()
    expect(first && getComputedStyle(first).fill).toBe(getComputedStyle(number).backgroundColor)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps the numbers neutral without the bar', async () => {
    const screen = await renderExample({})
    expect(screen.container.querySelector('svg')).toBeNull()
    const one = getComputedStyle(screen.getByText('1', { exact: true }).element())
    const three = getComputedStyle(screen.getByText('3', { exact: true }).element())
    expect(one.backgroundColor).toBe(three.backgroundColor)
  })

  it('cuts a long destination after two lines and keeps a 7-digit amount whole', async () => {
    const label = 'Investimento para a troca do carro da família em 2027 '.repeat(3).trim()
    const screen = await renderExample({
      amountCents: 125620000,
      parts: [{ position: 1, label, amountCents: 125620000 }],
    })
    expectClampedToTwoLines(screen.getByText(label).element())
    const row = screen.getByRole('listitem').first().element()
    const amounts = screen.getByText('R$ 1.256.200,00').elements()
    for (const amount of amounts.filter((element) => row.contains(element))) {
      expectWholeAmount(amount, row)
    }
  })
})

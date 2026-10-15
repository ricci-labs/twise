import { MatchQuestion } from '@web/components/finance/match-question/match-question'
import type { MatchQuestionProps } from '@web/components/finance/match-question/match-question.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function question(overrides: Partial<MatchQuestionProps> = {}): MatchQuestionProps {
  return {
    title: 'Isto paga alguma conta prevista?',
    lead: 'Você registrou **Conta de luz**, R$ 214,37, pela Conta Y. Ela parece com:',
    options: [
      { value: 'light', title: 'Luz', detail: 'Prevista para 22/10 · ≈ R$ 180,00' },
      { value: 'internet', title: 'Internet', detail: 'Atrasada desde 18/10 · R$ 120,00' },
    ],
    optionsLabel: 'Contas previstas',
    value: 'light',
    onValueChange: vi.fn(),
    isOpen: true,
    onOpenChange: vi.fn(),
    declineLabel: 'Não, nenhuma',
    confirmLabel: 'Paga a Luz',
    onDecline: vi.fn(),
    onConfirm: vi.fn(),
    ...overrides,
  }
}

describe('MatchQuestion', () => {
  it('lets one of several planned bills be chosen, the chosen one outlined', async () => {
    const props = question()
    await render(<MatchQuestion {...props} />)
    const dialog = page.getByRole('dialog', { name: 'Isto paga alguma conta prevista?' })
    await expect.element(dialog.getByText('Conta de luz')).toBeVisible()
    await expect.element(dialog.getByRole('radio', { name: /Luz/ })).toBeChecked()
    await dialog.getByRole('radio', { name: /Internet/ }).click()
    expect(props.onValueChange).toHaveBeenCalledWith('internet')
    await dialog.getByRole('button', { name: 'Paga a Luz' }).click()
    expect(props.onConfirm).toHaveBeenCalledOnce()
    await dialog.getByRole('button', { name: 'Não, nenhuma' }).click()
    expect(props.onDecline).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(dialog.element())
  })

  it('shows a single planned bill as a card, with the note and any problem', async () => {
    await render(
      <MatchQuestion
        {...question({
          title: 'Este lançamento paga a Internet de 18/10?',
          lead: undefined,
          note: 'Você acabou de registrar **Internet**, R$ 120,00, pela Conta X.',
          options: [
            {
              value: 'internet',
              title: 'Internet',
              detail: 'Prevista para 18/10 · R$ 120,00 · Conta X',
            },
          ],
          value: 'internet',
          problem: 'Esse lançamento já paga outro previsto.',
        })}
      />,
    )
    const dialog = page.getByRole('dialog', { name: /Este lançamento paga/ })
    await expect
      .element(dialog.getByText('Prevista para 18/10 · R$ 120,00 · Conta X'))
      .toBeVisible()
    await expect.element(dialog.getByRole('radio')).not.toBeInTheDocument()
    await expect.element(dialog.getByText('Esse lançamento já paga outro previsto.')).toBeVisible()
    await expectNoAccessibilityViolations(dialog.element())
  })
})

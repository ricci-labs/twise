import { TrashRow } from '@web/components/finance/trash-row/trash-row'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('TrashRow', () => {
  it('says what was deleted, when, by whom and why, and restores it', async () => {
    const onAction = vi.fn()
    const screen = await render(
      <ul>
        <TrashRow
          name="Conta antiga"
          icon="wallet"
          details={['Conta corrente', 'Excluída em 12/10/2026 por Member A']}
          note="Motivo: conta encerrada no banco."
          actionLabel="Restaurar"
          actionAccessibleLabel="Restaurar Conta antiga"
          onAction={onAction}
        />
      </ul>,
    )

    await expect.element(screen.getByText('Excluída em 12/10/2026 por Member A')).toBeVisible()
    await expect.element(screen.getByText('Motivo: conta encerrada no banco.')).toBeVisible()
    await screen.getByRole('button', { name: 'Restaurar Conta antiga' }).click()
    expect(onAction).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })
})

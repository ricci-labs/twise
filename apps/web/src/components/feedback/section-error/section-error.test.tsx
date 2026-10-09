import { SectionError } from '@web/components/feedback/section-error/section-error'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('SectionError', () => {
  it('says what failed, with its code, and tries that section again', async () => {
    const onRetry = vi.fn()
    const screen = await render(
      <SectionError
        message="Não foi possível carregar a previsão de saldo."
        errorRef="7F3A-2C91"
        onRetry={onRetry}
      />,
    )

    await expect.element(screen.getByRole('alert')).toBeVisible()
    await expect
      .element(screen.getByText('Não foi possível carregar a previsão de saldo.'))
      .toBeVisible()
    await expect.element(screen.getByText('Código: 7F3A-2C91')).toBeVisible()
    await screen.getByRole('button', { name: 'Tentar de novo' }).click()
    expect(onRetry).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })
})

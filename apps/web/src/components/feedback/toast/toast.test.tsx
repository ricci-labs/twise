import { showToast, Toaster } from '@web/components/feedback/toast/toast'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function removeInjectedSonnerStyles() {
  for (const style of document.querySelectorAll('style:not([data-vite-dev-id])')) {
    if (style.textContent?.includes('data-sonner-toaster')) {
      style.remove()
    }
  }
}

describe('Toast', () => {
  it('shows a short confirmation', async () => {
    await render(<Toaster />)
    showToast('Enviamos de novo.')
    await expect.element(page.getByText('Enviamos de novo.')).toBeVisible()
    await expectNoAccessibilityViolations(document.body)
  })

  it('marks a confirmation with the check', async () => {
    await render(<Toaster />)
    showToast('Lançamento registrado.', { tone: 'success' })
    const toast = page.getByText('Lançamento registrado.')

    await expect.element(toast).toBeVisible()
    expect(toast.element().parentElement?.querySelector('[data-icon=ok]')).not.toBeNull()
  })

  it('says a refusal out loud and waits for an answer', async () => {
    const onPress = vi.fn()
    await render(<Toaster />)
    showToast('Saúde, a categoria mãe, está na lixeira.', {
      tone: 'danger',
      action: { label: 'Restaurar as duas', onPress },
    })
    const alert = page.getByRole('alert')

    await expect.element(alert.getByText('Saúde, a categoria mãe, está na lixeira.')).toBeVisible()
    expect(alert.element().querySelector('[data-icon=alert]')).not.toBeNull()
    await page.getByRole('button', { name: 'Restaurar as duas' }).click()
    expect(onPress).toHaveBeenCalledOnce()
  })

  it('runs its action once and closes', async () => {
    const onPress = vi.fn()
    await render(<Toaster />)
    showToast('Lançamento movido para a lixeira.', { action: { label: 'Desfazer', onPress } })

    await page.getByRole('button', { name: 'Desfazer' }).click()

    expect(onPress).toHaveBeenCalledOnce()
    await expect
      .element(page.getByText('Lançamento movido para a lixeira.'))
      .not.toBeInTheDocument()
  })

  it('floats over the page even where the CSP blocks the styles Sonner injects', async () => {
    removeInjectedSonnerStyles()
    await render(<Toaster />)
    showToast('Nova versão disponível')
    await expect.element(page.getByText('Nova versão disponível')).toBeVisible()
    const toaster = document.querySelector('[data-sonner-toaster]') as HTMLElement
    expect(getComputedStyle(toaster).position).toBe('fixed')
  })
})

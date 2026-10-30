import { SettingsFormPage } from '@web/components/layout/settings-form-page/settings-form-page'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }
const READ_ONLY = 'Só donos e admins mudam as configurações.'

function settingsPage(readOnlyNote?: string) {
  return (
    <SettingsFormPage
      back={<a href="#configuracoes" />}
      backLabel="Voltar para Configurações"
      title="Nome e moeda"
      readOnlyNote={readOnlyNote}
      footer={<button type="submit">Salvar nome</button>}
    >
      <p>Casa</p>
    </SettingsFormPage>
  )
}

function footerOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-slot=settings-form-footer]')
}

describe('SettingsFormPage', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('keeps the save button in a footer at the bottom of the phone', async () => {
    await page.viewport(PHONE.width, PHONE.height)
    const screen = await render(settingsPage())

    await expect.element(screen.getByRole('heading', { name: 'Nome e moeda' })).toBeVisible()
    await expect
      .element(screen.getByRole('link', { name: 'Voltar para Configurações' }))
      .toBeVisible()
    const footer = footerOf(screen.container)?.getBoundingClientRect()
    expect(footer?.bottom).toBe(PHONE.height)
    expect(footer?.width).toBe(PHONE.width)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('puts the footer after the fields on the desktop', async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height)
    const screen = await render(settingsPage())

    const field = screen.getByText('Casa').element().getBoundingClientRect()
    const footer = footerOf(screen.container)?.getBoundingClientRect()
    expect(footer?.top).toBeGreaterThan(field.bottom)
    expect(footer?.bottom).toBeLessThan(DESKTOP.height)
  })

  it('shows the lock note and no save button to whoever only views', async () => {
    const screen = await render(settingsPage(READ_ONLY))

    await expect.element(screen.getByRole('status')).toHaveTextContent(READ_ONLY)
    expect(footerOf(screen.container)).toBeNull()
    expect(screen.getByRole('button', { name: 'Salvar nome' }).query()).toBeNull()
    await expectNoAccessibilityViolations(screen.container)
  })
})

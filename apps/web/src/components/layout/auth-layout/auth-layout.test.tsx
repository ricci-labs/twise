import { TextLink } from '@web/components/actions/text-link'
import { AuthFrame, AuthLayout } from '@web/components/layout/auth-layout/auth-layout'
import { MomentScreen } from '@web/components/layout/moment-screen'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

function renderLogin() {
  return render(
    <AuthLayout
      scene="welcome"
      title="Entrar no Twise"
      subtitle="Bom te ver de novo! Vamos ver como anda o mês?"
      footer={
        <>
          Ainda não tem conta? <TextLink href="/signup">Criar conta</TextLink>
        </>
      }
    >
      <p>Formulário</p>
    </AuthLayout>,
  )
}

describe('AuthLayout', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('titles the screen and keeps the owl decorative', async () => {
    const screen = await renderLogin()
    await expect
      .element(screen.getByRole('heading', { level: 1, name: 'Entrar no Twise' }))
      .toBeVisible()
    await expect.element(screen.getByRole('link', { name: 'Criar conta' })).toBeVisible()
    const owl = screen.container.querySelector('[data-scene]')
    expect(owl?.getAttribute('alt') ?? owl?.getAttribute('aria-hidden')).toMatch(/^(|true)$/)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('always shows the light theme, and gives the chosen theme back when it leaves', async () => {
    document.documentElement.classList.add('dark')
    const screen = await renderLogin()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    await screen.unmount()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('keeps the art in the frame while the next page is loading, and drops it for a moment', async () => {
    const page = (content: ReactNode) => <AuthFrame>{content}</AuthFrame>
    const screen = await render(
      page(
        <AuthLayout scene="welcome" title="Entrar no Twise" subtitle="Bom te ver de novo!">
          <p>Formulário</p>
        </AuthLayout>,
      ),
    )
    const art = screen.container.querySelector('[data-slot=logo]')?.parentElement

    await screen.rerender(page(<p>Carregando</p>))
    expect(screen.container.querySelector('[data-slot=logo]')?.parentElement).toBe(art)

    await screen.rerender(
      page(
        <MomentScreen tone="celebrate" scene="envelope" title="Confira seu e-mail">
          <p>Enviamos um e-mail.</p>
        </MomentScreen>,
      ),
    )
    await expect.element(screen.getByRole('heading', { name: 'Confira seu e-mail' })).toBeVisible()
    expect(screen.container.querySelector('[data-slot=auth-layout]')).toBeNull()
  })
})

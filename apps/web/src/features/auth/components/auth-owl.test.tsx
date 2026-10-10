import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { fakeApi, sessionRequired } from '@web/testing/fake-api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('the owl of the account screens', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stays mounted from log in to sign up and back, the old object shrinking away first', async () => {
    fakeApi({
      'GET /api/auth/me': sessionRequired,
      'GET /api/auth/config': () => Response.json({ isSignupEnabled: true }),
      'GET /api/health/ready': () => Response.json({ status: 'ready', version: 'dev' }),
    })
    const app = createApp(createMemoryHistory({ initialEntries: ['/login'] }))
    const screen = await render(<AppProviders app={app} />)
    await expect.element(screen.getByRole('heading', { name: 'Entrar no Twise' })).toBeVisible()
    const art = document.querySelector('[data-slot=logo]')?.parentElement

    await screen.getByRole('link', { name: 'Criar conta' }).click()
    await expect.element(screen.getByRole('heading', { name: 'Criar sua conta' })).toBeVisible()

    expect(document.querySelector('[data-slot=logo]')?.parentElement).toBe(art)
    await expect.poll(() => document.querySelector('[data-owl-leaving] #k-brilho-1')).not.toBeNull()
    const leaving = document.querySelector('[data-owl-leaving]')
    expect(leaving?.getAttribute('data-scene')).toBe('welcome')
    const animationOf = (id: string) =>
      getComputedStyle(leaving?.querySelector(id) as Element).animationName
    expect(animationOf('#k-brilho-1')).toBe('owl-leave')
    expect(animationOf('#k-base')).not.toBe('owl-leave')
    await expect
      .poll(() => document.querySelector('[data-owl-kit]')?.getAttribute('data-owl-kit'))
      .toBe('entrance-sign-up')

    await screen.getByRole('link', { name: 'Entrar' }).click()
    await expect.element(screen.getByRole('heading', { name: 'Entrar no Twise' })).toBeVisible()
    expect(document.querySelector('[data-slot=logo]')?.parentElement).toBe(art)
  })
})

import { AppSidebar } from '@web/components/navigation/app-sidebar/app-sidebar'
import type { NavItem } from '@web/components/navigation/nav-link'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const ITEMS: readonly NavItem[] = [
  {
    key: 'home',
    label: 'Início',
    icon: 'home',
    render: createElement('a', { href: '/w/1' }),
    isCurrent: true,
  },
  {
    key: 'entries',
    label: 'Lançamentos',
    icon: 'list',
    render: createElement('a', { href: '/w/1/entries' }),
  },
]
const MORE: readonly NavItem[] = [
  {
    key: 'members',
    label: 'Membros',
    icon: 'shield',
    render: createElement('a', { href: '/w/1/members' }),
  },
]

function renderSidebar(isCollapsed: boolean, onToggle = vi.fn()) {
  return render(
    <AppSidebar
      items={ITEMS}
      moreItems={MORE}
      primaryAction={{
        label: 'Novo lançamento',
        render: createElement('a', { href: '/w/1/entries/new' }),
      }}
      foot={<p>Casa</p>}
      isCollapsed={isCollapsed}
      onToggle={onToggle}
    />,
  )
}

describe('AppSidebar', () => {
  it('names the menu, marks the current page and groups the rest under "Mais"', async () => {
    const screen = await renderSidebar(false)

    await expect.element(screen.getByRole('navigation', { name: 'Menu principal' })).toBeVisible()
    await expect
      .element(screen.getByRole('link', { name: 'Início' }))
      .toHaveAttribute('aria-current', 'page')
    await expect.element(screen.getByText('Mais')).toBeVisible()
    await expect.element(screen.getByRole('link', { name: 'Novo lançamento' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('collapses to icons that keep their names, and opens again', async () => {
    const onToggle = vi.fn()
    const screen = await renderSidebar(true, onToggle)

    await expect.element(screen.getByRole('link', { name: 'Lançamentos' })).toBeVisible()
    await expect.element(screen.getByRole('link', { name: 'Novo lançamento' })).toBeVisible()
    expect(screen.container.textContent).not.toContain('Lançamentos')
    const toggle = screen.getByRole('button', { name: 'Abrir o menu' })
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    expect(onToggle).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows the name of a collapsed item on hover', async () => {
    const screen = await renderSidebar(true)

    await screen.getByRole('link', { name: 'Membros' }).hover()

    await expect.element(screen.getByText('Membros')).toBeVisible()
  })
})

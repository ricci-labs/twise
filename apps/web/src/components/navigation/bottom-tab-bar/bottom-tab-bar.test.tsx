import { BottomTabBar } from '@web/components/navigation/bottom-tab-bar/bottom-tab-bar'
import type { NavItem } from '@web/components/navigation/nav-link'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const TABS: readonly NavItem[] = [
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
  {
    key: 'cards',
    label: 'Cartões',
    icon: 'card',
    render: createElement('a', { href: '/w/1/cards' }),
  },
  {
    key: 'planning',
    label: 'Planejamento',
    icon: 'plan',
    render: createElement('a', { href: '/w/1/planning' }),
  },
  { key: 'more', label: 'Mais', icon: 'menu', render: <button type="button" /> },
]

describe('BottomTabBar', () => {
  it('shows five items on the phone, the current one marked', async () => {
    await page.viewport(390, 844)
    const screen = await render(<BottomTabBar items={TABS} />)

    await expect
      .element(screen.getByRole('link', { name: 'Início' }))
      .toHaveAttribute('aria-current', 'page')
    await expect.element(screen.getByRole('button', { name: 'Mais' })).toBeVisible()
    expect(screen.container.querySelectorAll('[data-slot=nav-link]')).toHaveLength(5)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('gives way to the sidebar from 1024 px', async () => {
    await page.viewport(1280, 800)
    const screen = await render(<BottomTabBar items={TABS} />)

    const bar = screen.container.querySelector('[data-slot=bottom-tab-bar]')
    expect(bar && getComputedStyle(bar).display).toBe('none')
    await page.viewport(390, 844)
  })
})

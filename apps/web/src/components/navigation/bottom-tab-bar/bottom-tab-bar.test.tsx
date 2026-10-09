import { BottomTabBar } from '@web/components/navigation/bottom-tab-bar/bottom-tab-bar'
import type { NavItem } from '@web/components/navigation/nav-link'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { backgroundOfClass, colorOfClass } from '@web/testing/colors'
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

  it('colors the current item in mint ink, with no fill, background or mark', async () => {
    await page.viewport(390, 844)
    const screen = await render(<BottomTabBar items={TABS} />)

    const current = screen.getByRole('link', { name: 'Início' }).element()
    const other = screen.getByRole('link', { name: 'Cartões' }).element()
    expect(getComputedStyle(current).color).toBe(colorOfClass('text-mint-ink'))
    expect(getComputedStyle(current).fontWeight).toBe('700')
    expect(getComputedStyle(current).backgroundColor).toBe(backgroundOfClass('bg-transparent'))
    expect(getComputedStyle(other).color).toBe(colorOfClass('text-ink-muted'))
    const fill = current.querySelector('[data-slot=icon-fill]')
    expect(fill && getComputedStyle(fill).fill).toBe('none')
    expect(current.querySelectorAll('span')).toHaveLength(1)
  })

  it('gives way to the sidebar from 1024 px', async () => {
    await page.viewport(1280, 800)
    const screen = await render(<BottomTabBar items={TABS} />)

    const bar = screen.container.querySelector('[data-slot=bottom-tab-bar]')
    expect(bar && getComputedStyle(bar).display).toBe('none')
    await page.viewport(390, 844)
  })
})

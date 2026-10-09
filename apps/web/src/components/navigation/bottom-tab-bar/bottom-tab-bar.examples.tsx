import { BottomTabBar } from '@web/components/navigation/bottom-tab-bar/bottom-tab-bar'
import type { NavItem } from '@web/components/navigation/nav-link'
import type { ComponentExamples } from '@web/lib/examples.types'
import { createElement } from 'react'

const link = createElement('a', { href: '#exemplo' })

const TABS: readonly NavItem[] = [
  { key: 'home', label: 'Início', icon: 'home', render: link, isCurrent: true },
  { key: 'entries', label: 'Lançamentos', icon: 'list', render: link },
  { key: 'cards', label: 'Cartões', icon: 'card', render: link },
  { key: 'planning', label: 'Planejamento', icon: 'plan', render: link },
  { key: 'more', label: 'Mais', icon: 'menu', render: <button type="button" /> },
]

export const bottomTabBarExamples: ComponentExamples = {
  component: 'BottomTabBar',
  examples: [
    {
      name: 'Início selecionado',
      render: () => <BottomTabBar items={TABS} className="relative lg:grid" />,
    },
  ],
}

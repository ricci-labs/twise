import { AppSidebar } from '@web/components/navigation/app-sidebar/app-sidebar'
import type { NavItem } from '@web/components/navigation/nav-link'
import type { ComponentExamples } from '@web/lib/examples.types'
import { createElement, useState } from 'react'

const link = createElement('a', { href: '#exemplo' })

const ITEMS: readonly NavItem[] = [
  { key: 'home', label: 'Início', icon: 'home', render: link, isCurrent: true },
  { key: 'entries', label: 'Lançamentos', icon: 'list', render: link },
  { key: 'cards', label: 'Cartões', icon: 'card', render: link },
  { key: 'planning', label: 'Planejamento', icon: 'plan', render: link },
]

const MORE: readonly NavItem[] = [
  { key: 'contacts', label: 'Contatos e cobranças', icon: 'users', render: link },
  { key: 'accounts', label: 'Contas e categorias', icon: 'wallet', render: link },
  { key: 'members', label: 'Membros', icon: 'shield', render: link },
]

function SidebarExample({ startsCollapsed }: { startsCollapsed: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(startsCollapsed)
  return (
    <div className="flex h-160 overflow-hidden rounded-lg border border-border">
      <AppSidebar
        items={ITEMS}
        moreItems={MORE}
        primaryAction={{ label: 'Novo lançamento', render: <button type="button" /> }}
        foot={<p className="px-2 text-body-sm text-ink-muted">Casa · Dono · 2 pessoas</p>}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((current) => !current)}
        className="h-full"
      />
    </div>
  )
}

export const appSidebarExamples: ComponentExamples = {
  component: 'AppSidebar',
  examples: [
    { name: 'Aberta', render: () => <SidebarExample startsCollapsed={false} /> },
    { name: 'Recolhida', render: () => <SidebarExample startsCollapsed /> },
  ],
}

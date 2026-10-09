import { useSuspenseQuery } from '@tanstack/react-query'
import { useLocation } from '@tanstack/react-router'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { Tip } from '@web/components/feedback/tip'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { AppShell } from '@web/components/layout/app-shell'
import { AppSidebar } from '@web/components/navigation/app-sidebar'
import { BottomTabBar } from '@web/components/navigation/bottom-tab-bar'
import type { NavItem } from '@web/components/navigation/nav-link'
import { workspaceAccessQueryOptions } from '@web/features/workspaces/api/workspaces.queries'
import { MobileTopBar } from '@web/features/workspaces/components/mobile-top-bar'
import { MoreSheet } from '@web/features/workspaces/components/more-sheet'
import {
  currentAreaOf,
  workspaceNavigation,
} from '@web/features/workspaces/components/workspace-navigation'
import { WorkspaceSwitcher } from '@web/features/workspaces/components/workspace-switcher'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { WorkspaceShellProps } from '@web/features/workspaces/workspaces.types'
import { useSidebarCollapsed } from '@web/hooks/use-sidebar-collapsed'
import { isReadOnly } from '@web/lib/permissions'
import { cloneElement, useState } from 'react'

const messages = workspacesMessages.shell
const MAIN_TABS = 4

export function WorkspaceShell({
  workspaceId,
  accountMenu,
  accountActions,
  children,
}: WorkspaceShellProps) {
  const { data: access } = useSuspenseQuery(workspaceAccessQueryOptions(workspaceId))
  const pathname = useLocation({ select: (location) => location.pathname })
  const sidebar = useSidebarCollapsed()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const navigation = workspaceNavigation(workspaceId, access.permissions, currentAreaOf(pathname))
  const moreTab: NavItem = {
    key: 'more',
    label: messages.nav.more,
    icon: 'menu',
    render: <button type="button" onClick={() => setIsMoreOpen(true)} />,
    isCurrent: navigation.more.some((item) => item.isCurrent),
  }

  return (
    <AppShell
      sidebar={
        <AppSidebar
          items={navigation.main}
          moreItems={navigation.more}
          primaryAction={
            navigation.newEntry
              ? { label: messages.newEntry, render: navigation.newEntry }
              : undefined
          }
          isCollapsed={sidebar.isCollapsed}
          isFading={sidebar.isFading}
          onToggle={sidebar.toggle}
          foot={
            sidebar.isCollapsed ? null : (
              <>
                <p className="px-2 text-caption font-semibold tracking-wide text-ink-subtle uppercase">
                  {messages.workspace}
                </p>
                <WorkspaceSwitcher access={access} />
                {accountMenu}
              </>
            )
          }
        />
      }
      banner={<OfflineBanner />}
      bottomBar={
        <>
          <BottomTabBar items={[...navigation.main.slice(0, MAIN_TABS), moreTab]} />
          <MoreSheet
            items={navigation.more}
            accountActions={accountActions}
            isOpen={isMoreOpen}
            onOpenChange={setIsMoreOpen}
          />
        </>
      }
      floatingAction={
        navigation.newEntry &&
        cloneElement(navigation.newEntry, {
          'aria-label': messages.newEntry,
          className:
            'grid size-fab place-items-center rounded-full bg-mint text-on-mint shadow-float',
          children: <TwiseIcon name="plus" />,
        })
      }
    >
      <MobileTopBar access={access} />
      {isReadOnly(access.permissions) && (
        <div className="px-4 pt-3 lg:px-8">
          <Tip>{messages.readOnly}</Tip>
        </div>
      )}
      {children}
    </AppShell>
  )
}

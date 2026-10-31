import { useSuspenseQuery } from '@tanstack/react-query'
import { useLocation } from '@tanstack/react-router'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { Tip } from '@web/components/feedback/tip'
import { showToast } from '@web/components/feedback/toast'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { AppShell } from '@web/components/layout/app-shell'
import { AppSidebar } from '@web/components/navigation/app-sidebar'
import { BottomTabBar } from '@web/components/navigation/bottom-tab-bar'
import type { NavItem } from '@web/components/navigation/nav-link'
import { workspaceAccessQueryOptions } from '@web/features/workspaces/api/workspaces.queries'
import { LastUpdated } from '@web/features/workspaces/components/last-updated'
import { MobileTopBar } from '@web/features/workspaces/components/mobile-top-bar'
import { MoreSheet } from '@web/features/workspaces/components/more-sheet'
import {
  currentAreaOf,
  hasNewEntryButton,
  hasTabBar,
  isUnderMore,
  tabAreaOf,
  workspaceNavigation,
} from '@web/features/workspaces/components/workspace-navigation'
import { WorkspaceSwitcher } from '@web/features/workspaces/components/workspace-switcher'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { WorkspaceShellProps } from '@web/features/workspaces/workspaces.types'
import { useCanInstall } from '@web/hooks/use-can-install'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { useSidebarCollapsed } from '@web/hooks/use-sidebar-collapsed'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { install } from '@web/lib/install-prompt'
import { isReadOnly } from '@web/lib/permissions'
import { cloneElement, type MouseEvent, useState } from 'react'

const messages = workspacesMessages.shell
const MAIN_TABS = 4
const INSTALL_ITEM: NavItem = {
  key: 'install',
  label: messages.nav.install,
  icon: 'install',
  render: <button type="button" onClick={() => void install()} />,
}

export function WorkspaceShell({
  workspaceId,
  accountMenu,
  accountActions,
  notice,
  children,
}: WorkspaceShellProps) {
  const { data: access } = useSuspenseQuery(workspaceAccessQueryOptions(workspaceId))
  const pathname = useLocation({ select: (location) => location.pathname })
  const sidebar = useSidebarCollapsed()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const canInstall = useCanInstall()
  const currentArea = currentAreaOf(pathname)
  const navigation = workspaceNavigation(workspaceId, access.permissions, currentArea)
  const tabs = workspaceNavigation(workspaceId, access.permissions, tabAreaOf(currentArea))
  const moreItems = canInstall ? [...navigation.more, INSTALL_ITEM] : navigation.more
  const moreTab: NavItem = {
    key: 'more',
    label: messages.nav.more,
    icon: 'menu',
    render: <button type="button" onClick={() => setIsMoreOpen(true)} />,
    isCurrent: isUnderMore(currentArea) || tabs.more.some((item) => item.isCurrent),
  }

  return (
    <div className="contents" onClickCapture={refuseWritesOffline}>
      <AppShell
        sidebar={
          <AppSidebar
            items={navigation.main}
            moreItems={moreItems}
            primaryAction={
              navigation.newEntry
                ? { label: messages.newEntry, render: navigation.newEntry }
                : undefined
            }
            isCollapsed={sidebar.isCollapsed}
            isFading={sidebar.isFading}
            onToggle={sidebar.toggle}
            foot={
              <>
                <p className="mx-3 mt-4.5 mb-1.5 text-overline text-ink-subtle uppercase group-data-collapsed/sidebar:hidden">
                  {messages.workspace}
                </p>
                <WorkspaceSwitcher access={access} />
                <div className="mt-1 border-t border-border pt-2.5 group-data-collapsed/sidebar:border-t-0">
                  {accountMenu}
                </div>
              </>
            }
          />
        }
        banner={<OfflineBanner message={messages.offline} aside={<LastUpdated />} />}
        bottomBar={
          <>
            {hasTabBar(pathname) && (
              <BottomTabBar items={[...tabs.main.slice(0, MAIN_TABS), moreTab]} />
            )}
            <MoreSheet
              items={moreItems}
              accountActions={accountActions}
              isOpen={isMoreOpen}
              onOpenChange={setIsMoreOpen}
            />
          </>
        }
        floatingAction={
          navigation.newEntry &&
          hasNewEntryButton(pathname) &&
          cloneElement(navigation.newEntry, {
            'aria-label': messages.newEntry,
            className:
              'grid size-fab place-items-center rounded-full bg-mint text-on-mint shadow-float',
            children: <TwiseIcon name="plus" />,
          })
        }
      >
        <MobileTopBar access={access} />
        {notice}
        {isReadOnly(access.permissions) && (!isDesktop || currentArea !== null) && (
          <Tip tone="readOnly" className="mx-4 mt-2 lg:mx-8 lg:mt-7 lg:self-start">
            {messages.readOnly}
          </Tip>
        )}
        {children}
      </AppShell>
    </div>
  )
}

function refuseWritesOffline(event: MouseEvent<HTMLDivElement>) {
  const isWrite = event.target instanceof Element && event.target.closest('[data-write]')
  if (!isWrite || navigator.onLine) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  showToast(messages.offlineWrite)
}

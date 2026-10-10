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
  workspaceNavigation,
} from '@web/features/workspaces/components/workspace-navigation'
import { WorkspaceSwitcher } from '@web/features/workspaces/components/workspace-switcher'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { WorkspaceShellProps } from '@web/features/workspaces/workspaces.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { useSidebarCollapsed } from '@web/hooks/use-sidebar-collapsed'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { isReadOnly } from '@web/lib/permissions'
import { cloneElement, type MouseEvent, useState } from 'react'

const messages = workspacesMessages.shell
const MAIN_TABS = 4

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
  const navigation = workspaceNavigation(workspaceId, access.permissions, currentAreaOf(pathname))
  const moreTab: NavItem = {
    key: 'more',
    label: messages.nav.more,
    icon: 'menu',
    render: <button type="button" onClick={() => setIsMoreOpen(true)} />,
    isCurrent: navigation.more.some((item) => item.isCurrent),
  }

  return (
    <div className="contents" onClickCapture={refuseWritesOffline}>
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
        banner={<OfflineBanner message={messages.offline} aside={<LastUpdated />} />}
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
        {notice}
        {isReadOnly(access.permissions) && (!isDesktop || currentAreaOf(pathname) !== null) && (
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

import { Tooltip } from '@base-ui/react/tooltip'
import { Button } from '@web/components/actions/button'
import { Logo } from '@web/components/brand/logo'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { appSidebarMessages as messages } from '@web/components/navigation/app-sidebar/app-sidebar.messages'
import type {
  AppSidebarProps,
  SidebarLabelProps,
  SidebarNavListProps,
} from '@web/components/navigation/app-sidebar/app-sidebar.types'
import {
  appSidebarVariants,
  sidebarDividerVariants,
  sidebarFootVariants,
  sidebarGroupVariants,
  sidebarHeadVariants,
  sidebarLabelVariants,
  sidebarToggleVariants,
  sidebarTooltipVariants,
} from '@web/components/navigation/app-sidebar/app-sidebar.variants'
import { NavLink } from '@web/components/navigation/nav-link'
import { cn } from '@web/lib/cn'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'

export function AppSidebar({
  items,
  moreItems,
  primaryAction,
  foot,
  isCollapsed,
  isFading = false,
  onToggle,
  className,
}: AppSidebarProps) {
  const Toggle = isCollapsed ? ChevronsRight : ChevronsLeft
  return (
    <Tooltip.Provider delay={200}>
      <nav
        data-slot="app-sidebar"
        data-collapsed={isCollapsed ? '' : undefined}
        data-fading={isFading ? '' : undefined}
        aria-label={messages.label}
        className={cn(appSidebarVariants({ isCollapsed }), className)}
      >
        <div className={sidebarHeadVariants({ isCollapsed })}>
          <Logo variant={isCollapsed ? 'icon' : 'full'} />
          <button
            type="button"
            className={sidebarToggleVariants()}
            aria-label={isCollapsed ? messages.expand : messages.collapse}
            aria-expanded={!isCollapsed}
            onClick={onToggle}
          >
            <Toggle className="size-4.5" aria-hidden="true" />
          </button>
        </div>
        {primaryAction && (
          <Labelled label={primaryAction.label} isCollapsed={isCollapsed}>
            {isCollapsed ? (
              <Button
                size="icon"
                aria-label={primaryAction.label}
                render={primaryAction.render}
                className="my-2.5 self-center"
              >
                <TwiseIcon name="plus" />
              </Button>
            ) : (
              <Button width="full" render={primaryAction.render} className="mt-3 mb-2.5">
                <TwiseIcon name="plus" size="md" />
                <span className={sidebarLabelVariants()}>{primaryAction.label}</span>
              </Button>
            )}
          </Labelled>
        )}
        <NavList items={items} isCollapsed={isCollapsed} />
        {moreItems.length > 0 &&
          (isCollapsed ? (
            <hr className={sidebarDividerVariants()} />
          ) : (
            <p className={cn(sidebarGroupVariants(), sidebarLabelVariants())}>{messages.more}</p>
          ))}
        <NavList items={moreItems} isCollapsed={isCollapsed} />
        <div className={sidebarFootVariants()}>{foot}</div>
      </nav>
    </Tooltip.Provider>
  )
}

function NavList({ items, isCollapsed }: SidebarNavListProps) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li key={item.key} className="flex flex-col">
          <Labelled label={item.label} isCollapsed={isCollapsed}>
            <NavLink item={item} layout={isCollapsed ? 'icon' : 'sidebar'} />
          </Labelled>
        </li>
      ))}
    </ul>
  )
}

function Labelled({ label, isCollapsed, children }: SidebarLabelProps) {
  if (!isCollapsed) {
    return children
  }
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side="right" sideOffset={8}>
          <Tooltip.Popup className={sidebarTooltipVariants()}>{label}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

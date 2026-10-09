import { bottomTabBarMessages as messages } from '@web/components/navigation/bottom-tab-bar/bottom-tab-bar.messages'
import type { BottomTabBarProps } from '@web/components/navigation/bottom-tab-bar/bottom-tab-bar.types'
import { bottomTabBarVariants } from '@web/components/navigation/bottom-tab-bar/bottom-tab-bar.variants'
import { NavLink } from '@web/components/navigation/nav-link'
import { cn } from '@web/lib/cn'

export function BottomTabBar({ items, className }: BottomTabBarProps) {
  return (
    <nav
      data-slot="bottom-tab-bar"
      aria-label={messages.label}
      className={cn(bottomTabBarVariants(), className)}
    >
      {items.map((item) => (
        <NavLink key={item.key} item={item} layout="tab" />
      ))}
    </nav>
  )
}

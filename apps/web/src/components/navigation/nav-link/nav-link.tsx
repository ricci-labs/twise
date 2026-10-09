import { useRender } from '@base-ui/react/use-render'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import type { NavLinkProps } from '@web/components/navigation/nav-link/nav-link.types'
import {
  navLinkLabelVariants,
  navLinkVariants,
} from '@web/components/navigation/nav-link/nav-link.variants'
import { cn } from '@web/lib/cn'

export function NavLink({ item, layout = 'sidebar', className, ...props }: NavLinkProps) {
  const isTab = layout === 'tab'
  return useRender({
    render: item.render,
    props: {
      ...props,
      'data-slot': 'nav-link',
      'aria-current': item.isCurrent ? 'page' : undefined,
      'aria-label': layout === 'icon' ? item.label : undefined,
      className: cn(navLinkVariants({ layout }), className),
      children: (
        <>
          <TwiseIcon
            name={item.icon}
            tone={isTab || item.isCurrent ? 'inherit' : 'muted'}
            size={isTab ? 'lg' : 'md'}
          />
          {layout !== 'icon' && (
            <span className={navLinkLabelVariants({ layout })}>{item.label}</span>
          )}
        </>
      ),
    },
  })
}

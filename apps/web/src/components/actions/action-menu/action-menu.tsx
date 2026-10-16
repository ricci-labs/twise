import { Menu } from '@base-ui/react/menu'
import type {
  ActionMenuEntryProps,
  ActionMenuProps,
} from '@web/components/actions/action-menu/action-menu.types'
import {
  actionMenuDetailVariants,
  actionMenuHeaderVariants,
  actionMenuItemVariants,
  actionMenuPopupVariants,
  actionMenuSeparatorVariants,
} from '@web/components/actions/action-menu/action-menu.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { Fragment } from 'react'

export function ActionMenu({
  trigger,
  groups,
  header,
  side = 'bottom',
  align = 'start',
  onOpenChange,
}: ActionMenuProps) {
  return (
    <Menu.Root onOpenChange={(open) => onOpenChange?.(open)}>
      <Menu.Trigger render={trigger} />
      <Menu.Portal>
        <Menu.Positioner side={side} align={align} sideOffset={8}>
          <Menu.Popup data-slot="action-menu" className={actionMenuPopupVariants()}>
            {header && <div className={actionMenuHeaderVariants()}>{header}</div>}
            {groups.map((group, index) => (
              <Fragment key={group[0]?.key ?? index}>
                {index > 0 && <Menu.Separator className={actionMenuSeparatorVariants()} />}
                {group.map((item) => (
                  <MenuEntry key={item.key} item={item} />
                ))}
              </Fragment>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function MenuEntry({ item }: ActionMenuEntryProps) {
  return (
    <Menu.Item
      render={item.render}
      onClick={item.onSelect}
      aria-current={item.isCurrent ? true : undefined}
      className={actionMenuItemVariants({ tone: item.tone })}
    >
      {item.icon && <TwiseIcon name={item.icon} />}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{item.label}</span>
        {item.detail && <span className={actionMenuDetailVariants()}>{item.detail}</span>}
      </span>
    </Menu.Item>
  )
}

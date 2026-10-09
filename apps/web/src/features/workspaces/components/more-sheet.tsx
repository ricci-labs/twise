import { Sheet } from '@web/components/layout/sheet'
import { NavLink } from '@web/components/navigation/nav-link'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { MoreSheetProps } from '@web/features/workspaces/workspaces.types'

export function MoreSheet({ items, accountActions, isOpen, onOpenChange }: MoreSheetProps) {
  return (
    <Sheet title={workspacesMessages.shell.nav.more} isOpen={isOpen} onOpenChange={onOpenChange}>
      <ul className="flex flex-col gap-0.5" onClickCapture={() => onOpenChange(false)}>
        {items.map((item) => (
          <li key={item.key} className="flex flex-col">
            <NavLink item={item} />
          </li>
        ))}
      </ul>
      {accountActions}
    </Sheet>
  )
}

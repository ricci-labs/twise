import { ActionMenu } from '@web/components/actions/action-menu'
import { itemActionsMessages as messages } from '@web/components/actions/item-actions/item-actions.messages'
import type {
  ActionSheetProps,
  ActionSheetRowProps,
  ItemActionsProps,
} from '@web/components/actions/item-actions/item-actions.types'
import {
  actionSheetListVariants,
  actionSheetRowVariants,
  itemActionsTriggerVariants,
} from '@web/components/actions/item-actions/item-actions.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { Sheet } from '@web/components/layout/sheet'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { cloneElement, useState } from 'react'

export function ItemActions({
  title,
  description,
  triggerLabel,
  actions,
  trigger,
  align = 'end',
  onOpenChange,
}: ItemActionsProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  if (actions.length === 0) {
    return null
  }
  const opener = trigger ?? (
    <button type="button" aria-label={triggerLabel} className={itemActionsTriggerVariants()}>
      <TwiseIcon name="more" />
    </button>
  )
  if (isDesktop) {
    return (
      <ActionMenu
        trigger={opener}
        align={align}
        onOpenChange={onOpenChange}
        groups={[
          actions.map(({ key, label, icon, tone, onSelect, render }) => ({
            key,
            label,
            icon,
            tone,
            onSelect,
            render,
          })),
        ]}
      />
    )
  }
  return (
    <ActionSheet
      title={title}
      description={description}
      actions={actions}
      trigger={opener}
      onOpenChange={onOpenChange}
    />
  )
}

function ActionSheet({ title, description, actions, trigger, onOpenChange }: ActionSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const changeOpen = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }
  return (
    <Sheet
      title={title}
      description={description}
      closeLabel={messages.close}
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={changeOpen}
    >
      <ul className={actionSheetListVariants()}>
        {actions.map((action) => (
          <li key={action.key}>
            <ActionSheetRow action={action} onDone={() => changeOpen(false)} />
          </li>
        ))}
      </ul>
    </Sheet>
  )
}

function ActionSheetRow({ action, onDone }: ActionSheetRowProps) {
  const className = actionSheetRowVariants({ tone: action.tone })
  const content = (
    <>
      <TwiseIcon name={action.icon} />
      {action.label}
    </>
  )
  const press = () => {
    onDone()
    action.onSelect?.()
  }
  if (action.render) {
    return cloneElement(action.render, { className, onClick: press }, content)
  }
  return (
    <button type="button" className={className} onClick={press}>
      {content}
    </button>
  )
}

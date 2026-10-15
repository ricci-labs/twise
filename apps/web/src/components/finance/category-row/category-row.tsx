import { Collapsible } from '@base-ui/react/collapsible'
import { CategoryArt } from '@web/components/display/category-art'
import { categoryRowMessages as messages } from '@web/components/finance/category-row/category-row.messages'
import type { CategoryRowProps } from '@web/components/finance/category-row/category-row.types'
import {
  categoryRowActionsVariants,
  categoryRowChipsVariants,
  categoryRowDetailVariants,
  categoryRowLineVariants,
  categoryRowMainVariants,
  categoryRowNameTextVariants,
  categoryRowNameVariants,
  categoryRowToggleVariants,
  categoryRowVariants,
} from '@web/components/finance/category-row/category-row.variants'
import { ChevronDown } from 'lucide-react'
import { Children } from 'react'

export function CategoryRow({
  name,
  icon,
  badge,
  detail,
  subcategoryCount = 0,
  isOpen = false,
  onOpenChange,
  add,
  actions,
  children,
}: CategoryRowProps) {
  const main = (
    <div className={categoryRowMainVariants()}>
      <CategoryArt name={name} icon={icon} size="list" />
      <div className="min-w-0">
        <p className={categoryRowNameVariants()}>
          <span className={categoryRowNameTextVariants()}>{name}</span>
          {badge}
        </p>
        {detail && <p className={categoryRowDetailVariants()}>{detail}</p>}
      </div>
    </div>
  )
  const actionSlot = actions && <div className={categoryRowActionsVariants()}>{actions}</div>
  if (subcategoryCount === 0 || !onOpenChange) {
    return (
      <li data-slot="category-row" className={categoryRowVariants()}>
        <div className={categoryRowLineVariants()}>
          {main}
          {add}
          {actionSlot}
        </div>
        {Children.toArray(children).length > 0 && (
          <div className={categoryRowChipsVariants()}>{children}</div>
        )}
      </li>
    )
  }
  return (
    <Collapsible.Root
      render={<li />}
      data-slot="category-row"
      open={isOpen}
      onOpenChange={onOpenChange}
      className={categoryRowVariants()}
    >
      <div className={categoryRowLineVariants()}>
        {main}
        <Collapsible.Trigger
          aria-label={isOpen ? messages.hide(name) : messages.show(name)}
          className={categoryRowToggleVariants()}
        >
          {messages.count(subcategoryCount)}
          <ChevronDown aria-hidden="true" />
        </Collapsible.Trigger>
        {actionSlot}
      </div>
      <Collapsible.Panel className={categoryRowChipsVariants()}>{children}</Collapsible.Panel>
    </Collapsible.Root>
  )
}

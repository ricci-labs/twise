import { Collapsible } from '@base-ui/react/collapsible'
import { archivedToggleMessages as messages } from '@web/components/display/archived-toggle/archived-toggle.messages'
import type { ArchivedToggleProps } from '@web/components/display/archived-toggle/archived-toggle.types'
import {
  archivedToggleTriggerVariants,
  archivedToggleVariants,
} from '@web/components/display/archived-toggle/archived-toggle.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { ChevronDown } from 'lucide-react'

export function ArchivedToggle({ count, children, isOpen, onOpenChange }: ArchivedToggleProps) {
  if (count === 0) {
    return null
  }
  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={(open) => onOpenChange?.(open)}
      data-slot="archived-toggle"
      className={archivedToggleVariants()}
    >
      <Collapsible.Trigger className={archivedToggleTriggerVariants()}>
        <TwiseIcon name="archive" size="sm" />
        {messages.label(count)}
        <ChevronDown data-slot="chevron" aria-hidden="true" />
      </Collapsible.Trigger>
      <Collapsible.Panel>{children}</Collapsible.Panel>
    </Collapsible.Root>
  )
}

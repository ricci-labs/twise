import { Popover } from '@base-ui/react/popover'
import { helpPopoverMessages as messages } from '@web/components/display/help-popover/help-popover.messages'
import type { HelpPopoverProps } from '@web/components/display/help-popover/help-popover.types'
import {
  helpPopupVariants,
  helpTriggerVariants,
} from '@web/components/display/help-popover/help-popover.variants'
import { CircleHelp } from 'lucide-react'

export function HelpPopover({ topic, children }: HelpPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger aria-label={messages.label(topic)} className={helpTriggerVariants()}>
        <CircleHelp className="size-4" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={6}>
          <Popover.Popup data-slot="help-popover" className={helpPopupVariants()}>
            <Popover.Title className="sr-only">{topic}</Popover.Title>
            <Popover.Description>{children}</Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

import { Collapsible } from '@base-ui/react/collapsible'
import type { ChargeStatus } from '@financas/shared'
import { ItemActions } from '@web/components/actions/item-actions'
import { Amount } from '@web/components/display/amount'
import { Badge, type BadgeProps } from '@web/components/display/badge'
import { chargeRowMessages as messages } from '@web/components/finance/charge-row/charge-row.messages'
import type { ChargeRowProps } from '@web/components/finance/charge-row/charge-row.types'
import {
  chargeRowAmountVariants,
  chargeRowBodyVariants,
  chargeRowChevronVariants,
  chargeRowDetailVariants,
  chargeRowHeadVariants,
  chargeRowLineVariants,
  chargeRowMenuVariants,
  chargeRowTitleVariants,
  chargeRowToggleVariants,
  chargeRowVariants,
} from '@web/components/finance/charge-row/charge-row.variants'
import { formatShortDate } from '@web/lib/format/calendar'
import { ChevronDown } from 'lucide-react'

const STATUS_TONES = {
  draft: 'neutral',
  sent: 'warning',
  partially_paid: 'partial',
  paid: 'success',
  cancelled: 'neutral',
} as const satisfies Record<ChargeStatus, BadgeProps['tone']>

export function ChargeRow({
  createdOn,
  amountCents,
  status,
  itemCount,
  sentVia,
  hasEmailFailed = false,
  isOpen,
  onOpenChange,
  actions = [],
  children,
}: ChargeRowProps) {
  const day = formatShortDate(createdOn)
  const title = messages.title(day)
  const channel = hasEmailFailed ? messages.emailFailed : sentVia && messages.channels[sentVia]
  const detail = [messages.items(itemCount), channel].filter(Boolean).join(messages.separator)
  return (
    <Collapsible.Root
      render={<li />}
      data-slot="charge-row"
      open={isOpen}
      onOpenChange={onOpenChange}
      className={chargeRowVariants()}
    >
      <div className={chargeRowHeadVariants()}>
        <Collapsible.Trigger className={chargeRowToggleVariants()}>
          <span className={chargeRowLineVariants()}>
            <span className={chargeRowTitleVariants()}>{title}</span>
            <Amount cents={amountCents} size="inherit" className={chargeRowAmountVariants()} />
            <ChevronDown aria-hidden="true" className={chargeRowChevronVariants({ isOpen })} />
          </span>
          <span className={chargeRowDetailVariants()}>
            <Badge tone={STATUS_TONES[status]} size="xs" hasDot>
              {messages.statuses[status]}
            </Badge>
            {detail}
          </span>
        </Collapsible.Trigger>
        {isOpen && actions.length > 0 && (
          <div className={chargeRowMenuVariants()}>
            <ItemActions title={title} triggerLabel={messages.actions(day)} actions={actions} />
          </div>
        )}
      </div>
      <Collapsible.Panel className={chargeRowBodyVariants()}>{children}</Collapsible.Panel>
    </Collapsible.Root>
  )
}

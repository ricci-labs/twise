import { Amount } from '@web/components/display/amount'
import { Avatar } from '@web/components/display/avatar'
import { shareRowsMessages as messages } from '@web/components/finance/share-rows/share-rows.messages'
import type { ShareRowsProps } from '@web/components/finance/share-rows/share-rows.types'
import {
  shareAmountVariants,
  shareLeaderVariants,
  shareNameVariants,
  shareNoteVariants,
  shareRowsVariants,
  shareRowVariants,
} from '@web/components/finance/share-rows/share-rows.variants'

export function ShareRows({ shares, ownCents, ownLabel = messages.own, note }: ShareRowsProps) {
  return (
    <>
      <ul data-slot="share-rows" className={shareRowsVariants()}>
        {shares.map((share) => (
          <li key={share.key} className={shareRowVariants()}>
            <span className={shareNameVariants()}>
              <Avatar name={share.name} tone="paper" size="xs" />
              {share.name}
            </span>
            <span aria-hidden="true" className={shareLeaderVariants()} />
            <Amount cents={share.amountCents} size="inherit" className={shareAmountVariants()} />
          </li>
        ))}
        <li className={shareRowVariants({ isOwn: true })}>
          <span>{ownLabel}</span>
          <span aria-hidden="true" className={shareLeaderVariants()} />
          <Amount cents={ownCents} size="inherit" className={shareAmountVariants()} />
        </li>
      </ul>
      {note && <p className={shareNoteVariants()}>{note}</p>}
    </>
  )
}

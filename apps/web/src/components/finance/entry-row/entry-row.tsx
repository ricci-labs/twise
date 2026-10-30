import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import { MetaLine } from '@web/components/display/meta-line'
import { entryRowMessages as messages } from '@web/components/finance/entry-row/entry-row.messages'
import type {
  EntryAmountProps,
  EntryMarksProps,
  EntryRowProps,
  EntryTitleProps,
} from '@web/components/finance/entry-row/entry-row.types'
import {
  entryRowAmountVariants,
  entryRowBadgeVariants,
  entryRowDetailVariants,
  entryRowMainVariants,
  entryRowMarkVariants,
  entryRowMatchVariants,
  entryRowTextVariants,
  entryRowTitleTextVariants,
  entryRowTitleVariants,
  entryRowVariants,
} from '@web/components/finance/entry-row/entry-row.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { cn } from '@web/lib/cn'
import { partsMatching } from '@web/lib/long-lists'
import type { TextPart } from '@web/lib/long-lists.types'
import { Paperclip } from 'lucide-react'
import { cloneElement } from 'react'

const SIGNED_CENTS = { out: -1, in: 1, neutral: 1 } as const

export function EntryRow({
  description,
  detail,
  art,
  amountCents,
  direction,
  installmentCount = 1,
  isShared = false,
  hasReceipt = false,
  search = '',
  link,
}: EntryRowProps) {
  const className = entryRowMainVariants()
  const content = (
    <>
      <CategoryArt name={art.name} icon={art.icon} size="md" />
      <span className={entryRowTextVariants()}>
        <EntryTitle
          description={description}
          installmentCount={installmentCount}
          isShared={isShared}
          hasReceipt={hasReceipt}
          search={search}
        />
        <span className={entryRowDetailVariants()}>
          <MetaLine text={detail} />
        </span>
      </span>
      <EntryAmount amountCents={amountCents} direction={direction} />
    </>
  )
  return (
    <li data-slot="entry-row" className={entryRowVariants()}>
      {link ? (
        cloneElement(link, { className }, content)
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  )
}

function withOffsets(parts: readonly TextPart[]) {
  let offset = 0
  return parts.map((part) => {
    const placed = { part, offset }
    offset += part.text.length
    return placed
  })
}

function EntryTitle({
  description,
  installmentCount = 1,
  isShared,
  hasReceipt,
  search = '',
}: EntryTitleProps) {
  return (
    <span className={entryRowTitleVariants()}>
      <span className={entryRowTitleTextVariants()}>
        {withOffsets(partsMatching(description, search)).map(({ part, offset }) =>
          part.isMatch ? (
            <mark key={offset} className={entryRowMatchVariants()}>
              {part.text}
            </mark>
          ) : (
            part.text
          ),
        )}
      </span>
      <EntryMarks installmentCount={installmentCount} isShared={isShared} hasReceipt={hasReceipt} />
    </span>
  )
}

export function EntryMarks({ installmentCount = 1, isShared, hasReceipt }: EntryMarksProps) {
  return (
    <>
      {installmentCount > 1 && (
        <span className={entryRowBadgeVariants()}>
          <span aria-hidden="true">{messages.installments(installmentCount)}</span>
          <span className="sr-only">{messages.installmentsLabel(installmentCount)}</span>
        </span>
      )}
      {isShared && (
        <span className={entryRowMarkVariants()} role="img" aria-label={messages.shared}>
          <TwiseIcon name="users" />
        </span>
      )}
      {hasReceipt && (
        <span className={entryRowMarkVariants()} role="img" aria-label={messages.receipt}>
          <Paperclip aria-hidden="true" />
        </span>
      )}
    </>
  )
}

export function EntryAmount({ amountCents, direction, className }: EntryAmountProps) {
  return (
    <Amount
      cents={SIGNED_CENTS[direction] * Math.abs(amountCents)}
      sign={direction === 'in' ? 'always' : 'auto'}
      size="inherit"
      className={cn(entryRowAmountVariants({ direction }), className)}
    />
  )
}

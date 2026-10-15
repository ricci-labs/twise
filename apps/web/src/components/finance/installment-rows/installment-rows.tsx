import { Button } from '@web/components/actions/button'
import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { installmentRowsMessages as messages } from '@web/components/finance/installment-rows/installment-rows.messages'
import type {
  InstallmentRowsProps,
  InstallmentRowViewProps,
} from '@web/components/finance/installment-rows/installment-rows.types'
import {
  installmentAmountVariants,
  installmentDetailVariants,
  installmentDueVariants,
  installmentMonthVariants,
  installmentNumberVariants,
  installmentRowMainVariants,
  installmentRowsVariants,
  installmentRowVariants,
  installmentTextVariants,
} from '@web/components/finance/installment-rows/installment-rows.variants'
import { ChevronRight } from 'lucide-react'
import { cloneElement, useState } from 'react'

const SHOWN_AT_FIRST = 3

export function InstallmentRows({
  rows,
  start = 0,
  showMoreLabel = messages.showMore,
}: InstallmentRowsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isShort = rows.length <= SHOWN_AT_FIRST
  const first = Math.min(Math.max(start, 0), Math.max(rows.length - SHOWN_AT_FIRST, 0))
  const shown = isExpanded || isShort ? rows : rows.slice(first, first + SHOWN_AT_FIRST)
  return (
    <>
      <ul data-slot="installment-rows" className={installmentRowsVariants()}>
        {shown.map((row) => (
          <li key={row.key} className={installmentRowVariants()}>
            <InstallmentRowView row={row} />
          </li>
        ))}
      </ul>
      {!isExpanded && !isShort && (
        <Button
          variant="tertiary"
          size="xs"
          className="mt-2 px-0"
          onClick={() => setIsExpanded(true)}
        >
          {showMoreLabel(rows.length - SHOWN_AT_FIRST)}
        </Button>
      )}
    </>
  )
}

function InstallmentRowView({ row }: InstallmentRowViewProps) {
  const className = installmentRowMainVariants()
  const content = (
    <>
      <span className={installmentNumberVariants()}>{row.number}</span>
      <span className={installmentTextVariants()}>
        <span className={installmentMonthVariants()}>{row.month}</span>
        <span className={installmentDetailVariants()}>
          <Badge tone={row.status.tone} size="status" hasDot>
            {row.status.label}
          </Badge>
          <span className={installmentDueVariants()}>{row.due}</span>
        </span>
      </span>
      <Amount cents={row.amountCents} size="inherit" className={installmentAmountVariants()} />
      {row.link && <ChevronRight aria-hidden="true" />}
    </>
  )
  return row.link ? (
    cloneElement(row.link, { className }, content)
  ) : (
    <div className={className}>{content}</div>
  )
}

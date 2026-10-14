import { Badge } from '@web/components/display/badge'
import { invoiceYearSheetMessages as messages } from '@web/components/finance/invoice-year-sheet/invoice-year-sheet.messages'
import type { InvoiceYearSheetProps } from '@web/components/finance/invoice-year-sheet/invoice-year-sheet.types'
import {
  invoiceYearArrowVariants,
  invoiceYearGridVariants,
  invoiceYearHeadVariants,
  invoiceYearLabelVariants,
  invoiceYearMonthNameVariants,
  invoiceYearMonthTotalVariants,
  invoiceYearMonthVariants,
  invoiceYearNoteVariants,
} from '@web/components/finance/invoice-year-sheet/invoice-year-sheet.variants'
import { Sheet } from '@web/components/layout/sheet'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cloneElement } from 'react'

export function InvoiceYearSheet({
  title,
  year,
  months,
  note,
  isOpen,
  onOpenChange,
  onPrevious,
  onNext,
}: InvoiceYearSheetProps) {
  return (
    <Sheet title={title} isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className={invoiceYearHeadVariants()}>
        <h3 className={invoiceYearLabelVariants()}>{year}</h3>
        <div className="flex">
          <button
            type="button"
            aria-label={messages.previous}
            disabled={!onPrevious}
            onClick={onPrevious}
            className={invoiceYearArrowVariants()}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={messages.next}
            disabled={!onNext}
            onClick={onNext}
            className={invoiceYearArrowVariants()}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul className={invoiceYearGridVariants()}>
        {months.map((month) => (
          <li key={month.key} onClickCapture={() => onOpenChange(false)}>
            {cloneElement(
              month.link,
              {
                className: invoiceYearMonthVariants(),
                'aria-current': month.isCurrent ? 'true' : undefined,
              },
              <>
                <b className={invoiceYearMonthNameVariants()}>{month.month}</b>
                <Badge tone={month.status.tone} size="xs">
                  {month.status.label}
                </Badge>
                <span className={invoiceYearMonthTotalVariants()}>{month.total}</span>
              </>,
            )}
          </li>
        ))}
      </ul>
      <p className={invoiceYearNoteVariants()}>{note}</p>
    </Sheet>
  )
}

import type { InvoiceMonthStripProps } from '@web/components/finance/invoice-month-strip/invoice-month-strip.types'
import {
  invoiceAllVariants,
  invoiceMonthNameVariants,
  invoiceMonthStatusVariants,
  invoiceMonthStripVariants,
  invoiceMonthVariants,
  invoiceYearVariants,
} from '@web/components/finance/invoice-month-strip/invoice-month-strip.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { cloneElement, Fragment, useEffect, useRef } from 'react'

export function InvoiceMonthStrip({ label, months, allLabel, onAll }: InvoiceMonthStripProps) {
  const stripRef = useRef<HTMLElement>(null)
  const current = months.find((month) => month.isCurrent)?.key

  useEffect(() => {
    const strip = stripRef.current
    const chosen = strip?.querySelector<HTMLElement>('[aria-current="true"]')
    if (strip && chosen && current) {
      strip.scrollLeft = chosen.offsetLeft - strip.clientWidth / 2 + chosen.clientWidth / 2
    }
  }, [current])

  return (
    <nav
      ref={stripRef}
      aria-label={label}
      data-slot="invoice-month-strip"
      className={invoiceMonthStripVariants()}
    >
      {months.map((month) => (
        <Fragment key={month.key}>
          {month.yearBefore && (
            <span aria-hidden="true" className={invoiceYearVariants()}>
              {month.yearBefore}
            </span>
          )}
          {cloneElement(
            month.link,
            {
              'aria-label': month.accessibleLabel,
              'aria-current': month.isCurrent ? 'true' : undefined,
              className: invoiceMonthVariants({ isCurrent: month.isCurrent }),
            },
            <>
              <b className={invoiceMonthNameVariants()}>{month.month}</b>
              <small className={invoiceMonthStatusVariants()}>{month.status}</small>
            </>,
          )}
        </Fragment>
      ))}
      <button type="button" aria-haspopup="dialog" className={invoiceAllVariants()} onClick={onAll}>
        <TwiseIcon name="calendar" />
        {allLabel}
      </button>
    </nav>
  )
}

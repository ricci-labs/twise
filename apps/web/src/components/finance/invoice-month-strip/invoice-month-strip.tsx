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

export function InvoiceMonthStrip({
  label,
  months,
  anchor,
  allLabel,
  onAll,
}: InvoiceMonthStripProps) {
  const stripRef = useRef<HTMLElement>(null)
  const hasPlacedRef = useRef(false)
  const current = months.find((month) => month.isCurrent)?.key

  useEffect(() => {
    const strip = stripRef.current
    if (!strip || !current) {
      return
    }
    const items = [...strip.querySelectorAll<HTMLElement>(MONTH_SELECTOR)]
    const chosen = items.find((item) => item.dataset.month === current)
    if (!hasPlacedRef.current) {
      const opening = items.findIndex((item) => item.dataset.month === (anchor ?? current))
      strip.scrollLeft = scrollEndingWith(strip, items, items[opening + 1] ?? items[opening])
      hasPlacedRef.current = true
    }
    strip.scrollLeft = scrollToShow(strip, chosen)
  }, [current, anchor])

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
              'data-slot': 'invoice-month',
              'data-month': month.key,
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

const MONTH_SELECTOR = '[data-slot=invoice-month]'

function scrollEndingWith(
  strip: HTMLElement,
  items: readonly HTMLElement[],
  last: HTMLElement | undefined,
): number {
  if (!last) {
    return strip.scrollLeft
  }
  const style = getComputedStyle(strip)
  const paddingLeft = Number.parseFloat(style.paddingLeft)
  const end = last.offsetLeft + last.offsetWidth + Number.parseFloat(style.paddingRight)
  const first = items.find((item) => item.offsetLeft - paddingLeft >= end - strip.clientWidth)
  return first ? Math.max(0, first.offsetLeft - paddingLeft) : 0
}

function scrollToShow(strip: HTMLElement, item: HTMLElement | undefined): number {
  if (!item) {
    return strip.scrollLeft
  }
  const style = getComputedStyle(strip)
  const start = item.offsetLeft - Number.parseFloat(style.paddingLeft)
  const end = item.offsetLeft + item.offsetWidth + Number.parseFloat(style.paddingRight)
  if (start < strip.scrollLeft) {
    return start
  }
  if (end > strip.scrollLeft + strip.clientWidth) {
    return end - strip.clientWidth
  }
  return strip.scrollLeft
}

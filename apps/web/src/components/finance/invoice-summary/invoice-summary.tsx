import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import type { InvoiceSummaryProps } from '@web/components/finance/invoice-summary/invoice-summary.types'
import {
  invoiceSummaryActionVariants,
  invoiceSummaryBarVariants,
  invoiceSummaryDatesVariants,
  invoiceSummaryFactLabelVariants,
  invoiceSummaryFactsVariants,
  invoiceSummaryFactValueVariants,
  invoiceSummaryFactVariants,
  invoiceSummaryHeadVariants,
  invoiceSummaryLegendVariants,
  invoiceSummaryNoteVariants,
  invoiceSummarySplitVariants,
  invoiceSummarySwatchVariants,
  invoiceSummaryTitleVariants,
  invoiceSummaryTotalVariants,
  invoiceSummaryVariants,
} from '@web/components/finance/invoice-summary/invoice-summary.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'

const FULL = 100
const GAP = 3

export function InvoiceSummary({
  title,
  status,
  dates,
  totalCents,
  paid,
  due,
  own,
  fronted,
  splitLabel,
  note,
  action,
}: InvoiceSummaryProps) {
  const ownPercent = totalCents > 0 ? (own.cents / totalCents) * FULL : FULL
  return (
    <section data-slot="invoice-summary" aria-label={title} className={invoiceSummaryVariants()}>
      <div className={invoiceSummaryHeadVariants()}>
        <h2 className={invoiceSummaryTitleVariants()}>{title}</h2>
        <Badge tone={status.tone} hasDot>
          {status.label}
        </Badge>
      </div>
      <p className={invoiceSummaryDatesVariants()}>{dates}</p>
      <p className={invoiceSummaryTotalVariants()}>
        <Amount cents={totalCents} size="total" isCentsRaised />
      </p>
      <dl className={invoiceSummaryFactsVariants()}>
        {[paid, due].map((fact) => (
          <div key={fact.label} className={invoiceSummaryFactVariants()}>
            <dt className={invoiceSummaryFactLabelVariants()}>{fact.label}</dt>
            <dd className={invoiceSummaryFactValueVariants()}>
              <Amount cents={fact.cents} size="inherit" />
            </dd>
          </div>
        ))}
      </dl>
      <div className={invoiceSummarySplitVariants()}>
        <svg
          role="img"
          aria-label={splitLabel}
          className={invoiceSummaryBarVariants()}
          preserveAspectRatio="none"
        >
          <rect x="0" y="0" width={`${ownPercent}%`} height="10" rx="4" className="fill-chart-4" />
          {fronted.cents > 0 && (
            <>
              <rect
                x={`${ownPercent}%`}
                y="0"
                width={`${FULL - ownPercent}%`}
                height="10"
                rx="4"
                className="fill-chart-3"
              />
              <rect x={`${ownPercent}%`} y="0" width={GAP} height="10" className="fill-surface" />
            </>
          )}
        </svg>
        <ul className={invoiceSummaryLegendVariants()}>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className={invoiceSummarySwatchVariants({ part: 'own' })} />
            {own.label}{' '}
            <b>
              <Amount cents={own.cents} size="inherit" />
            </b>
          </li>
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={invoiceSummarySwatchVariants({ part: 'fronted' })}
            />
            {fronted.label}{' '}
            <b>
              <Amount cents={fronted.cents} size="inherit" />
            </b>
          </li>
        </ul>
      </div>
      {note && (
        <p className={invoiceSummaryNoteVariants({ tone: note.tone })}>
          <TwiseIcon name={note.icon} size="sm" />
          {note.text}
        </p>
      )}
      {action && <div className={invoiceSummaryActionVariants()}>{action}</div>}
    </section>
  )
}

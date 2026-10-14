import { ProgressBar } from '@web/components/charts/progress-bar'
import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import type { CardBlockProps } from '@web/components/finance/card-block/card-block.types'
import {
  cardBlockAmountVariants,
  cardBlockBestVariants,
  cardBlockCycleVariants,
  cardBlockFineVariants,
  cardBlockHeadVariants,
  cardBlockInvoiceLabelVariants,
  cardBlockInvoiceValueVariants,
  cardBlockInvoiceVariants,
  cardBlockLimitHeadVariants,
  cardBlockLimitVariants,
  cardBlockNameLinkVariants,
  cardBlockNameTextVariants,
  cardBlockNameVariants,
  cardBlockVariants,
} from '@web/components/finance/card-block/card-block.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { ColorSwatch } from '@web/components/inputs/color-swatch'
import { ChevronRight } from 'lucide-react'
import { cloneElement } from 'react'

export function CardBlock({
  name,
  icon,
  color,
  cycle,
  link,
  invoice,
  limit,
  open,
  bestDay,
  actions,
}: CardBlockProps) {
  return (
    <article data-slot="card-block" aria-label={name} className={cardBlockVariants()}>
      <header className={cardBlockHeadVariants()}>
        {cloneElement(
          link,
          { className: cardBlockNameLinkVariants() },
          <>
            <CategoryArt name={name} icon={icon} size="lg" />
            <span className={cardBlockNameTextVariants()}>
              <span className={cardBlockNameVariants()}>
                <span>{name}</span>
                <ColorSwatch color={color} />
              </span>
              <span className={cardBlockCycleVariants()}>{cycle}</span>
            </span>
          </>,
        )}
        {actions && <div className="-mr-2 shrink-0">{actions}</div>}
      </header>
      {cloneElement(
        invoice.link,
        { className: cardBlockInvoiceVariants() },
        <>
          <span className={cardBlockInvoiceLabelVariants()}>{invoice.label}</span>
          <span className={cardBlockInvoiceValueVariants()}>
            <span className={cardBlockAmountVariants()}>
              <Amount cents={invoice.amountCents} size="inherit" />
            </span>
            <span className={cardBlockFineVariants()}>{invoice.due}</span>
          </span>
          <ChevronRight aria-hidden="true" />
        </>,
      )}
      <div className={cardBlockLimitVariants()}>
        {limit && (
          <>
            <p className={cardBlockLimitHeadVariants()}>
              <span>{limit.label}</span>
              <b>{limit.used}</b>
            </p>
            <ProgressBar percent={limit.percent} thickness="lg" className="mt-2" />
          </>
        )}
        <p className={cardBlockFineVariants()}>{open}</p>
      </div>
      <p className={cardBlockBestVariants()}>
        <TwiseIcon name="calendar" size="sm" />
        <span>
          {bestDay.label} <b>{bestDay.value}</b>
        </span>
      </p>
    </article>
  )
}

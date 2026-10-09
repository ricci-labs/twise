import type { CardProps } from '@web/components/display/card/card.types'
import {
  cardBodyVariants,
  cardFootVariants,
  cardHeadVariants,
  cardVariants,
} from '@web/components/display/card/card.variants'
import { cn } from '@web/lib/cn'
import { useId } from 'react'

export function Card({
  title,
  id,
  description,
  headerAction,
  footerStat,
  footerAction,
  layout,
  className,
  children,
}: CardProps) {
  const titleId = useId()
  const hasFooter = footerStat !== undefined || footerAction !== undefined
  return (
    <section
      data-slot="card"
      id={id}
      aria-labelledby={titleId}
      className={cn(cardVariants({ layout }), className)}
    >
      <div className={cardHeadVariants()}>
        <div className="min-w-0">
          <h2 id={titleId} className="text-title">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-body-sm text-ink-muted">{description}</p>}
        </div>
        {headerAction}
      </div>
      <div data-slot="card-body" className={cardBodyVariants()}>
        {children}
      </div>
      {hasFooter && (
        <div data-slot="card-foot" className={cardFootVariants()}>
          <span>{footerStat}</span>
          {footerAction}
        </div>
      )}
    </section>
  )
}

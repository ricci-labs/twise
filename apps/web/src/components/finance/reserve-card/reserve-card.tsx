import { formatBrl } from '@financas/shared'
import { ProgressBar } from '@web/components/charts/progress-bar'
import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import { RichText } from '@web/components/display/rich-text'
import { reserveCardMessages as messages } from '@web/components/finance/reserve-card/reserve-card.messages'
import type {
  ReserveCardProps,
  ReserveFigures,
} from '@web/components/finance/reserve-card/reserve-card.types'
import {
  reserveCardActionsVariants,
  reserveCardEmptyBodyVariants,
  reserveCardEmptyTextVariants,
  reserveCardFootVariants,
  reserveCardLabelVariants,
  reserveCardPillVariants,
  reserveCardProgressVariants,
  reserveCardTargetVariants,
  reserveCardTextVariants,
  reserveCardTopVariants,
  reserveCardValueVariants,
  reserveCardVariants,
} from '@web/components/finance/reserve-card/reserve-card.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { fill } from '@web/lib/format/template'

const RESERVE_ART = 'piggy-bank'
const MONTHS = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
})
const ONE_MONTH = 1

export function ReserveCard({ reserve, actions, createAction }: ReserveCardProps) {
  if (!reserve) {
    return (
      <section data-slot="reserve-card" className={reserveCardVariants({ isEmpty: true })}>
        <CategoryArt name={messages.title} icon={RESERVE_ART} size="hero" />
        <div className={reserveCardEmptyBodyVariants()}>
          <h2 className={reserveCardLabelVariants({ isEmpty: true })}>{messages.title}</h2>
          <p className={reserveCardEmptyTextVariants()}>{messages.empty}</p>
          {createAction}
        </div>
      </section>
    )
  }
  return (
    <section data-slot="reserve-card" aria-label={messages.title} className={reserveCardVariants()}>
      <div className={reserveCardTopVariants()}>
        <div className={reserveCardTextVariants()}>
          <h2 className={reserveCardLabelVariants()}>{messages.title}</h2>
          <Amount
            cents={reserve.savedCents}
            size="inherit"
            isCentsRaised
            className={reserveCardValueVariants()}
          />
          <p className={reserveCardTargetVariants()}>
            {fill(messages.ofTarget, {
              target: formatBrl(reserve.targetCents),
              account: reserve.accountName,
            })}
          </p>
        </div>
        <CategoryArt name={messages.title} icon={RESERVE_ART} size="hero" />
        {actions && <div className={reserveCardActionsVariants()}>{actions}</div>}
      </div>
      <div role="img" aria-label={messages.progress(reserve.percent)}>
        <ProgressBar percent={reserve.percent} tone="reserve" thickness="lg" />
      </div>
      <div className={reserveCardFootVariants()}>
        {reserve.coverageMonths !== null && (
          <span className={reserveCardPillVariants()}>
            <TwiseIcon name="shield" size="sm" />
            <span>
              <RichText
                text={messages.covers}
                values={{ months: monthsOf(reserve.coverageMonths) }}
              />
            </span>
          </span>
        )}
        <span className={reserveCardProgressVariants()}>{progressOf(reserve)}</span>
      </div>
    </section>
  )
}

function monthsOf(months: number): string {
  return messages.month(MONTHS.format(months), months === ONE_MONTH)
}

function progressOf({ percent, remainingCents, overCents }: ReserveFigures): string {
  if (remainingCents > 0) {
    return fill(messages.left, { percent, amount: formatBrl(remainingCents) })
  }
  if (overCents > 0) {
    return fill(messages.over, { percent, amount: formatBrl(overCents) })
  }
  return fill(messages.done, { percent })
}

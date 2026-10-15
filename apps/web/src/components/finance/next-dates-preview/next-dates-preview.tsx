import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import { nextDatesPreviewMessages as messages } from '@web/components/finance/next-dates-preview/next-dates-preview.messages'
import type { NextDatesPreviewProps } from '@web/components/finance/next-dates-preview/next-dates-preview.types'
import {
  nextDatesAmountVariants,
  nextDatesBodyVariants,
  nextDatesDateVariants,
  nextDatesListVariants,
  nextDatesNoteVariants,
  nextDatesPreviewVariants,
  nextDatesRowVariants,
  nextDatesTitleVariants,
  nextDatesWeekdayVariants,
} from '@web/components/finance/next-dates-preview/next-dates-preview.variants'

export function NextDatesPreview({ dates, title = messages.title, empty }: NextDatesPreviewProps) {
  return (
    <div data-slot="next-dates-preview" role="status" className={nextDatesPreviewVariants()}>
      <CategoryArt name={title} icon="calendar" />
      <div className={nextDatesBodyVariants()}>
        <p className={nextDatesTitleVariants()}>{title}</p>
        {dates.length === 0 && empty ? (
          <p className={nextDatesWeekdayVariants()}>{empty}</p>
        ) : (
          <ol className={nextDatesListVariants()}>
            {dates.map((next) => (
              <li key={next.key} className={nextDatesRowVariants()}>
                <span className={nextDatesDateVariants()}>{next.date}</span>
                <span className={nextDatesWeekdayVariants()}>{next.weekday}</span>
                <span className={nextDatesAmountVariants()}>
                  {next.isEstimate && messages.estimate}
                  <Amount cents={next.amountCents} size="inherit" />
                </span>
                {next.note && <small className={nextDatesNoteVariants()}>{next.note}</small>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

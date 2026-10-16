import { DateBlock } from '@web/components/display/date-block'
import { nextHolidayCardMessages as messages } from '@web/components/finance/next-holiday-card/next-holiday-card.messages'
import type {
  NextHolidayCardProps,
  NextHolidayDetailsProps,
} from '@web/components/finance/next-holiday-card/next-holiday-card.types'
import {
  nextHolidayCardVariants,
  nextHolidayEffectVariants,
  nextHolidayLabelVariants,
  nextHolidayMainVariants,
  nextHolidayNameVariants,
  nextHolidayNoneVariants,
  nextHolidayTextVariants,
  nextHolidayWhenVariants,
} from '@web/components/finance/next-holiday-card/next-holiday-card.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { formatDayMonthLong, formatLongWeekday, formatShortDate } from '@web/lib/format/calendar'
import { useId } from 'react'

export function NextHolidayCard({ holiday }: NextHolidayCardProps) {
  const labelId = useId()
  return (
    <section
      data-slot="next-holiday-card"
      aria-labelledby={labelId}
      className={nextHolidayCardVariants()}
    >
      <h2 id={labelId} className={nextHolidayLabelVariants()}>
        {messages.label}
      </h2>
      {holiday ? (
        <Holiday holiday={holiday} />
      ) : (
        <p className={nextHolidayNoneVariants()}>{messages.none}</p>
      )}
    </section>
  )
}

function Holiday({ holiday }: NextHolidayDetailsProps) {
  const effects = holiday.effects.map((effect) =>
    messages.effect(effect.description, formatShortDate(effect.toOn)),
  )
  return (
    <>
      <div className={nextHolidayMainVariants()}>
        <DateBlock date={holiday.onDate} tone="next" size="lg" digits="padded" />
        <div className={nextHolidayTextVariants()}>
          <p className={nextHolidayNameVariants()}>{holiday.name}</p>
          <p className={nextHolidayWhenVariants()}>
            {messages.when(formatLongWeekday(holiday.onDate), holiday.daysAway)}
            <span className="sr-only">{messages.date(formatDayMonthLong(holiday.onDate))}</span>
          </p>
        </div>
      </div>
      {effects.length > 0 && (
        <p className={nextHolidayEffectVariants()}>
          <TwiseIcon name="calendar" size="sm" />
          {messages.effects(effects)}
        </p>
      )}
    </>
  )
}

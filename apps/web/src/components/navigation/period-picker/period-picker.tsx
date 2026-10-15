import { type IsoDate, parseIsoDate } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { RangeCalendar } from '@web/components/inputs/range-calendar'
import { Sheet } from '@web/components/layout/sheet'
import { periodPickerMessages as messages } from '@web/components/navigation/period-picker/period-picker.messages'
import type {
  PeriodDatesProps,
  PeriodMonthsProps,
  PeriodPickerProps,
  PeriodPreset,
  PeriodStepProps,
} from '@web/components/navigation/period-picker/period-picker.types'
import {
  periodBarVariants,
  periodChipsVariants,
  periodChipVariants,
  periodDatesFooterVariants,
  periodDetailVariants,
  periodFailedVariants,
  periodLabelVariants,
  periodMonthRangeVariants,
  periodMonthsVariants,
  periodMonthVariants,
  periodNoteVariants,
  periodOthersLabelVariants,
  periodOthersVariants,
  periodStepVariants,
  periodYearVariants,
} from '@web/components/navigation/period-picker/period-picker.variants'
import { cn } from '@web/lib/cn'
import { formatDayMonth, formatRange, formatShortMonthName } from '@web/lib/format/calendar'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cloneElement, useState } from 'react'

const PRESETS: readonly PeriodPreset[] = ['last30Days', 'thisYear']
const MONTH_SKELETONS = Array.from({ length: 12 }, (_, index) => `month-${index}`)

export function PeriodPicker({
  title,
  detail,
  label = messages.label,
  previous,
  next,
  sheet,
  ranges,
  className,
}: PeriodPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isChoosingDates, setIsChoosingDates] = useState(false)
  const [button, setButton] = useState<HTMLButtonElement | null>(null)
  const close = () => setIsOpen(false)
  return (
    <nav
      aria-label={label}
      data-slot="period-picker"
      className={cn(periodBarVariants(), className)}
    >
      <PeriodStep link={previous} label={messages.previous} direction="previous" />
      <button
        ref={setButton}
        type="button"
        aria-haspopup="dialog"
        className={periodLabelVariants()}
        onClick={() => {
          setIsChoosingDates(false)
          setIsOpen(true)
        }}
      >
        <Calendar aria-hidden="true" />
        <span>{title}</span>
        {detail && <span className={periodDetailVariants()}>· {detail}</span>}
      </button>
      <PeriodStep link={next} label={messages.next} direction="next" />
      <Sheet
        title={isChoosingDates ? messages.chooseDates : messages.choose}
        closeLabel={messages.close}
        anchor={button}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        {isChoosingDates && ranges ? (
          <PeriodDates ranges={ranges} onBack={() => setIsChoosingDates(false)} onDone={close} />
        ) : (
          <PeriodMonths
            {...sheet}
            ranges={ranges}
            onChooseDates={() => setIsChoosingDates(true)}
            onDone={close}
          />
        )}
      </Sheet>
    </nav>
  )
}

function PeriodStep({ link, label, direction }: PeriodStepProps) {
  if (!link) {
    return <span aria-hidden="true" className={periodStepVariants()} />
  }
  return cloneElement(
    link,
    { 'aria-label': label, className: periodStepVariants() } as object,
    direction === 'previous' ? (
      <ChevronLeft aria-hidden="true" />
    ) : (
      <ChevronRight aria-hidden="true" />
    ),
  )
}

function PeriodMonths({
  year,
  periods,
  hasError = false,
  chosenLabel,
  currentLabel,
  note,
  onYearChange,
  onRetry,
  onPick,
  ranges,
  onChooseDates,
  onDone,
}: PeriodMonthsProps) {
  return (
    <>
      <div className={periodYearVariants()}>
        <span aria-live="polite">{year}</span>
        <span className="flex">
          <button
            type="button"
            aria-label={messages.previousYear}
            className={periodStepVariants()}
            onClick={() => onYearChange(year - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={messages.nextYear}
            className={periodStepVariants()}
            onClick={() => onYearChange(year + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </span>
      </div>
      {hasError ? (
        <div className={periodFailedVariants()}>
          <p>{messages.failed}</p>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {messages.retry}
            </Button>
          )}
        </div>
      ) : (
        <ul className={periodMonthsVariants()} aria-busy={periods === undefined}>
          {periods
            ? periods.map((period) => (
                <li key={period.label} className="contents">
                  <button
                    type="button"
                    aria-current={period.label === chosenLabel ? 'true' : undefined}
                    className={periodMonthVariants({ isFuture: period.label > currentLabel })}
                    onClick={() => {
                      onPick(period.label)
                      onDone()
                    }}
                  >
                    {formatShortMonthName(period.label)}
                    <span className={periodMonthRangeVariants()}>
                      {formatRange(period.start, period.end)}
                    </span>
                  </button>
                </li>
              ))
            : MONTH_SKELETONS.map((key) => (
                <li key={key} className={periodMonthVariants({ isFuture: false })} />
              ))}
        </ul>
      )}
      {ranges && (
        <div className={periodOthersVariants()}>
          <p className={periodOthersLabelVariants()}>{messages.others}</p>
          <div className={periodChipsVariants()}>
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={periodChipVariants()}
                onClick={() => {
                  ranges.onPreset(preset)
                  onDone()
                }}
              >
                {messages.presets[preset]}
              </button>
            ))}
            <button type="button" className={periodChipVariants()} onClick={onChooseDates}>
              <Calendar aria-hidden="true" />
              {messages.chooseDates}
            </button>
          </div>
        </div>
      )}
      <p className={periodNoteVariants()}>
        {note ? `${note} ${messages.futureNote}` : messages.futureNote}
      </p>
    </>
  )
}

function PeriodDates({ ranges, onBack, onDone }: PeriodDatesProps) {
  const [range, setRange] = useState(ranges.value)
  const { from, to } = range
  return (
    <>
      <RangeCalendar value={range} today={ranges.today} onChange={setRange} />
      <div className={periodDatesFooterVariants()}>
        <Button variant="tertiary" onClick={onBack}>
          {messages.back}
        </Button>
        {from && to ? (
          <Button
            onClick={() => {
              ranges.onRange({ from, to })
              onDone()
            }}
          >
            {messages.seeRange(rangeWords(from, to))}
          </Button>
        ) : (
          <Button isDisabled>{from ? messages.pickLast : messages.pickFirst}</Button>
        )}
      </div>
    </>
  )
}

function rangeWords(from: IsoDate, to: IsoDate): string {
  const start = parseIsoDate(from)
  const end = parseIsoDate(to)
  const sameMonth = start.year === end.year && start.month === end.month
  const first = sameMonth ? String(start.day) : formatDayMonth(from)
  return `${first}${messages.rangeJoin}${formatDayMonth(to)}`
}

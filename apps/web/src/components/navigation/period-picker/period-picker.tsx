import { Popover } from '@base-ui/react/popover'
import {
  addMonths,
  daysBetween,
  type IsoDate,
  parseIsoDate,
  toYearMonthLabel,
} from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { type DateRange, RangeCalendar } from '@web/components/inputs/range-calendar'
import { Sheet } from '@web/components/layout/sheet'
import { periodPickerMessages as messages } from '@web/components/navigation/period-picker/period-picker.messages'
import type {
  PeriodDatesProps,
  PeriodMonthsProps,
  PeriodPickerProps,
  PeriodPopoverProps,
  PeriodPreset,
  PeriodRangeFootProps,
  PeriodRanges,
  PeriodSheetData,
  PeriodShortcut,
  PeriodShortcutsProps,
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
  periodPopoverVariants,
  periodRangeFootVariants,
  periodRangeVariants,
  periodShortcutsVariants,
  periodShortcutVariants,
  periodStepVariants,
  periodYearVariants,
} from '@web/components/navigation/period-picker/period-picker.variants'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { cn } from '@web/lib/cn'
import {
  formatDayMonth,
  formatMonthLabel,
  formatRange,
  formatShortMonthName,
} from '@web/lib/format/calendar'
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
  const [bar, setBar] = useState<HTMLElement | null>(null)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const close = () => setIsOpen(false)
  return (
    <nav
      ref={setBar}
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
      {isDesktop && ranges ? (
        <PeriodPopover
          sheet={sheet}
          ranges={ranges}
          anchor={bar}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      ) : (
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
      )}
    </nav>
  )
}

function PeriodPopover({ sheet, ranges, anchor, isOpen, onOpenChange }: PeriodPopoverProps) {
  return (
    <Popover.Root open={isOpen} onOpenChange={(open) => onOpenChange(open)}>
      <Popover.Portal>
        <Popover.Positioner
          anchor={anchor}
          side="bottom"
          align="start"
          sideOffset={8}
          className="z-modal"
        >
          <Popover.Popup aria-label={messages.choose} className={periodPopoverVariants()}>
            <PeriodShortcuts sheet={sheet} ranges={ranges} onDone={() => onOpenChange(false)} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

function PeriodShortcuts({ sheet, ranges, onDone }: PeriodShortcutsProps) {
  const [range, setRange] = useState(() => shownRangeOf(sheet, ranges))
  const [isChoosing, setIsChoosing] = useState(false)
  const chosen: PeriodShortcut | null = isChoosing ? 'dates' : shortcutOf(sheet, ranges)
  const previous = previousLabelOf(sheet.currentLabel)
  const shortcuts: readonly { key: PeriodShortcut; label: string; onPress: () => void }[] = [
    {
      key: 'current',
      label: messages.thisPeriod(formatMonthLabel(sheet.currentLabel)),
      onPress: () => sheet.onPick(sheet.currentLabel),
    },
    { key: 'previous', label: messages.previousPeriod, onPress: () => sheet.onPick(previous) },
    ...PRESETS.map((preset) => ({
      key: preset,
      label: messages.presets[preset],
      onPress: () => ranges.onPreset(preset),
    })),
  ]
  return (
    <>
      <fieldset aria-label={messages.shortcuts} className={periodShortcutsVariants()}>
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.key}
            type="button"
            aria-pressed={chosen === shortcut.key}
            className={periodShortcutVariants()}
            onClick={() => {
              shortcut.onPress()
              onDone()
            }}
          >
            {shortcut.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={chosen === 'dates'}
          className={periodShortcutVariants()}
          onClick={() => setIsChoosing(true)}
        >
          {messages.chooseDates}
        </button>
      </fieldset>
      <div className={periodRangeVariants()}>
        <RangeCalendar
          value={range}
          today={ranges.today}
          hasEnds={false}
          onChange={(next) => {
            setIsChoosing(true)
            setRange(next)
          }}
        />
        <PeriodRangeFoot
          range={range}
          onApply={(picked) => {
            ranges.onRange(picked)
            onDone()
          }}
        />
      </div>
    </>
  )
}

function PeriodRangeFoot({ range: { from, to }, onApply }: PeriodRangeFootProps) {
  if (!from || !to) {
    return (
      <div className={periodRangeFootVariants()}>
        <p role="status">{from ? messages.pickLast : messages.pickFirst}</p>
        <Button size="sm" isDisabled>
          {messages.apply}
        </Button>
      </div>
    )
  }
  return (
    <div className={periodRangeFootVariants()}>
      <p role="status">
        <b>{formatRange(from, to)}</b>
        {` · ${messages.dayCount(daysBetween(from, to) + 1)}`}
      </p>
      <Button size="sm" onClick={() => onApply({ from, to })}>
        {messages.apply}
      </Button>
    </div>
  )
}

function shortcutOf(sheet: PeriodSheetData, ranges: PeriodRanges): PeriodShortcut | null {
  if (ranges.preset) {
    return ranges.preset
  }
  if (ranges.value.from) {
    return 'dates'
  }
  if (sheet.chosenLabel === sheet.currentLabel) {
    return 'current'
  }
  return sheet.chosenLabel === previousLabelOf(sheet.currentLabel) ? 'previous' : null
}

function shownRangeOf(sheet: PeriodSheetData, ranges: PeriodRanges): DateRange {
  if (ranges.value.from) {
    return ranges.value
  }
  const period = sheet.periods?.find((each) => each.label === sheet.chosenLabel)
  return period ? { from: period.start, to: period.end } : { from: null, to: null }
}

function previousLabelOf(label: string): string {
  return toYearMonthLabel(addMonths(parseIsoDate(`${label}-01`), -1))
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

import { addDays, type IsoDate } from '@financas/shared'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  DateChoice,
  DateFieldProps,
  ExpenseFormInput,
} from '@web/features/entries/entries.types'
import { formatDayMonth } from '@web/lib/format/calendar'
import { useRef } from 'react'
import { useController } from 'react-hook-form'

const messages = entriesMessages.dates

export function DateField({ today }: DateFieldProps) {
  const { field } = useController<ExpenseFormInput, 'occurredOn'>({ name: 'occurredOn' })
  const otherDate = useRef<HTMLInputElement>(null)
  const yesterday = addDays(today, -1)
  const choice = choiceOf(field.value, today, yesterday)

  function choose(next: string) {
    if (next === 'today') {
      field.onChange(today)
    } else if (next === 'yesterday') {
      field.onChange(yesterday)
    } else {
      otherDate.current?.showPicker()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-label text-ink">
        {entriesMessages.fields.date}
        <span aria-hidden="true" className="ml-0.5 text-danger">
          {entriesMessages.newEntry.requiredMark}
        </span>
      </span>
      <ChoiceChips
        label={entriesMessages.fields.date}
        variant="outline"
        value={choice}
        onSelect={choose}
        onBlur={field.onBlur}
        options={[
          { value: 'today', label: messages.today(formatDayMonth(today)) },
          { value: 'yesterday', label: messages.yesterday },
          {
            value: 'other',
            label: choice === 'other' ? formatDayMonth(field.value) : messages.other,
            icon: 'calendar',
            opensDialog: true,
          },
        ]}
      />
      <input
        ref={otherDate}
        type="date"
        tabIndex={-1}
        aria-label={messages.otherLabel}
        className="sr-only"
        value={field.value}
        onChange={(event) => {
          if (event.target.value) {
            field.onChange(event.target.value)
          }
        }}
      />
    </div>
  )
}

function choiceOf(value: IsoDate, today: IsoDate, yesterday: IsoDate): DateChoice {
  if (value === today) {
    return 'today'
  }
  return value === yesterday ? 'yesterday' : 'other'
}

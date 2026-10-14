import { addDays, type IsoDate } from '@financas/shared'
import { FieldGroup } from '@web/components/forms/field-group'
import { CalendarSheet } from '@web/components/inputs/calendar-sheet'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  DateChoice,
  DateFieldProps,
  EntryFormInput,
} from '@web/features/entries/entries.types'
import { formatDayMonth } from '@web/lib/format/calendar'
import { useState } from 'react'
import { useController } from 'react-hook-form'

const messages = entriesMessages.dates

export function DateField({ today }: DateFieldProps) {
  const { field } = useController<EntryFormInput, 'occurredOn'>({ name: 'occurredOn' })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [otherButton, setOtherButton] = useState<HTMLButtonElement | null>(null)
  const yesterday = addDays(today, -1)
  const choice = choiceOf(field.value, today, yesterday)

  function choose(next: string) {
    if (next === 'today') {
      field.onChange(today)
    } else if (next === 'yesterday') {
      field.onChange(yesterday)
    } else {
      setIsCalendarOpen(true)
    }
  }

  return (
    <FieldGroup label={entriesMessages.fields.date} isRequired>
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
            buttonRef: setOtherButton,
          },
        ]}
      />
      <CalendarSheet
        title={entriesMessages.fields.date}
        value={field.value}
        today={today}
        anchor={otherButton}
        isOpen={isCalendarOpen}
        onOpenChange={setIsCalendarOpen}
        onSelect={(date) => {
          field.onChange(date)
          setIsCalendarOpen(false)
        }}
      />
    </FieldGroup>
  )
}

function choiceOf(value: IsoDate, today: IsoDate, yesterday: IsoDate): DateChoice {
  if (value === today) {
    return 'today'
  }
  return value === yesterday ? 'yesterday' : 'other'
}

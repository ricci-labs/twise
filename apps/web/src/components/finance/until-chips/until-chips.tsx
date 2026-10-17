import type { IsoDate } from '@financas/shared'
import { untilChipsMessages as messages } from '@web/components/finance/until-chips/until-chips.messages'
import type {
  UntilChipsProps,
  UntilChoice,
  UntilNextDue,
} from '@web/components/finance/until-chips/until-chips.types'
import { FieldGroup } from '@web/components/forms/field-group'
import { CalendarSheet } from '@web/components/inputs/calendar-sheet'
import { type ChoiceChip, ChoiceChips } from '@web/components/inputs/choice-chips'
import { formatShortDate } from '@web/lib/format/calendar'
import { useState } from 'react'

export function UntilChips({
  today,
  next,
  value,
  onChange,
  label = messages.label,
  isDisabled = false,
}: UntilChipsProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [otherButton, setOtherButton] = useState<HTMLButtonElement | null>(null)
  const choice = choiceOf(value, today, next)

  function choose(picked: string) {
    if (picked === 'today') {
      onChange(today)
    } else if (picked === 'next' && next) {
      onChange(next.dueOn)
    } else {
      setIsCalendarOpen(true)
    }
  }

  const options: ChoiceChip[] = [
    { value: 'today', label: messages.today(formatShortDate(today)) },
    ...nextOption(next),
    {
      value: 'other',
      label: choice === 'other' ? messages.picked(formatShortDate(value)) : messages.other,
      opensDialog: true,
      buttonRef: setOtherButton,
    },
  ]

  return (
    <FieldGroup label={label} isRequired help={next ? messages.help : undefined}>
      <ChoiceChips
        label={label}
        variant="pillOutline"
        value={choice}
        onSelect={choose}
        isDisabled={isDisabled}
        options={options}
      />
      <CalendarSheet
        title={label}
        value={value}
        today={today}
        anchor={otherButton}
        isOpen={isCalendarOpen}
        onOpenChange={setIsCalendarOpen}
        onSelect={(date) => {
          onChange(date)
          setIsCalendarOpen(false)
        }}
      />
    </FieldGroup>
  )
}

function nextOption(next: UntilNextDue | null | undefined): ChoiceChip[] {
  if (!next) {
    return []
  }
  return [
    { value: 'next', label: messages.next(formatShortDate(next.dueOn), next.installmentCount) },
  ]
}

function choiceOf(
  value: IsoDate,
  today: IsoDate,
  next: UntilNextDue | null | undefined,
): UntilChoice {
  if (value === today) {
    return 'today'
  }
  return value === next?.dueOn ? 'next' : 'other'
}

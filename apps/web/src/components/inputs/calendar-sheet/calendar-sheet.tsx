import { type IsoDate, parseIsoDate, type YearMonth } from '@financas/shared'
import { CalendarMonth } from '@web/components/inputs/calendar-month'
import { calendarSheetMessages as messages } from '@web/components/inputs/calendar-sheet/calendar-sheet.messages'
import type { CalendarSheetProps } from '@web/components/inputs/calendar-sheet/calendar-sheet.types'
import { Sheet } from '@web/components/layout/sheet'
import { useState } from 'react'

export function CalendarSheet({
  title,
  value,
  today,
  anchor,
  isOpen,
  onOpenChange,
  onSelect,
}: CalendarSheetProps) {
  const [month, setMonth] = useState(() => monthOf(value ?? today))
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setMonth(monthOf(value ?? today))
    }
  }
  return (
    <Sheet
      title={title}
      closeLabel={messages.close}
      anchor={anchor}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <CalendarMonth
        month={month}
        today={today}
        selection={{ mode: 'single', value }}
        onMonthChange={setMonth}
        onPick={onSelect}
      />
    </Sheet>
  )
}

function monthOf(date: IsoDate): YearMonth {
  const { year, month } = parseIsoDate(date)
  return { year, month }
}

import type { IsoDate, YearMonth } from '@financas/shared'
import { CalendarMonth } from '@web/components/inputs/calendar-month/calendar-month'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const TODAY = '2026-10-20' as IsoDate

function Single() {
  const [month, setMonth] = useState<YearMonth>({ year: 2026, month: 10 })
  const [value, setValue] = useState<IsoDate | null>(TODAY)
  return (
    <div className="w-full max-w-90">
      <CalendarMonth
        month={month}
        today={TODAY}
        selection={{ mode: 'single', value }}
        onMonthChange={setMonth}
        onPick={setValue}
      />
    </div>
  )
}

export const calendarMonthExamples: ComponentExamples = {
  component: 'CalendarMonth',
  examples: [{ name: 'Um dia', render: () => <Single /> }],
}

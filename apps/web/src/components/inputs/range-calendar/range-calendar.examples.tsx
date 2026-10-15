import type { IsoDate } from '@financas/shared'
import { RangeCalendar } from '@web/components/inputs/range-calendar/range-calendar'
import type { DateRange } from '@web/components/inputs/range-calendar/range-calendar.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const TODAY = '2026-10-20' as IsoDate

function Example({ initial }: { initial: DateRange }) {
  const [range, setRange] = useState(initial)
  return (
    <div className="w-full max-w-90">
      <RangeCalendar value={range} today={TODAY} onChange={setRange} />
    </div>
  )
}

export const rangeCalendarExamples: ComponentExamples = {
  component: 'RangeCalendar',
  examples: [
    {
      name: 'Intervalo escolhido',
      render: () => <Example initial={{ from: '2026-10-05' as IsoDate, to: TODAY }} />,
    },
    {
      name: 'Só o primeiro dia',
      render: () => <Example initial={{ from: '2026-10-05' as IsoDate, to: null }} />,
    },
    { name: 'Nada ainda', render: () => <Example initial={{ from: null, to: null }} /> },
  ],
}

import { type IsoDate, type Period, periodStartingIn } from '@financas/shared'
import { PeriodPicker } from '@web/components/navigation/period-picker/period-picker'
import type { ComponentExamples } from '@web/lib/examples.types'
import type { ComponentProps } from 'react'
import { useState } from 'react'

function StepLink({ href, ...props }: ComponentProps<'a'>) {
  return <a href={href} {...props} />
}

const TODAY = '2026-10-20' as IsoDate

function periodsOf(year: number): Period[] {
  return Array.from({ length: 12 }, (_, index) =>
    periodStartingIn({ year, month: index + 1 }, { anchor: 'day_of_month', day: 5 }),
  )
}

function Example({ withRanges }: { withRanges: boolean }) {
  const [year, setYear] = useState(2026)
  const [chosen, setChosen] = useState('2026-10')
  const [shown, setShown] = useState('out/26')
  return (
    <div className="w-full max-w-90">
      <PeriodPicker
        title={shown}
        detail="5 out – 4 nov"
        previous={<StepLink href="#anterior" />}
        next={<StepLink href="#proximo" />}
        sheet={{
          year,
          periods: periodsOf(year),
          chosenLabel: chosen,
          currentLabel: '2026-10',
          note: 'O período começa no dia 5 (configurações do espaço).',
          onYearChange: setYear,
          onPick: setChosen,
        }}
        ranges={
          withRanges
            ? {
                today: TODAY,
                value: { from: null, to: null },
                onPreset: setShown,
                onRange: ({ from, to }) => setShown(`${from} – ${to}`),
              }
            : undefined
        }
      />
    </div>
  )
}

export const periodPickerExamples: ComponentExamples = {
  component: 'PeriodPicker',
  examples: [
    { name: 'Início: os meses do ano', render: () => <Example withRanges={false} /> },
    { name: 'Lançamentos: com outros intervalos', render: () => <Example withRanges /> },
  ],
}

import { DayField } from '@web/components/inputs/day-field'
import { RadioSentenceList } from '@web/components/inputs/radio-sentence-list/radio-sentence-list'
import { Select } from '@web/components/inputs/select'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const BUSINESS_DAYS = Array.from({ length: 10 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}º`,
}))

function DayRule({ initial }: { initial: string }) {
  const [rule, setRule] = useState(initial)
  const [day, setDay] = useState('10')
  const [businessDay, setBusinessDay] = useState('5')
  return (
    <div className="w-full max-w-100">
      <RadioSentenceList
        label="Quando"
        value={rule}
        onSelect={setRule}
        options={[
          {
            value: 'day',
            label: `No dia ${day} do mês`,
            before: 'No dia',
            after: 'do mês',
            picker: (
              <DayField
                size="inline"
                aria-label={`Dia do mês: ${day}`}
                title="Dia do mês"
                summary={(chosen) => `No dia **${chosen}** do mês`}
                value={day}
                onChange={(event) => {
                  setDay(event.target.value)
                  setRule('day')
                }}
              />
            ),
          },
          {
            value: 'businessDay',
            label: `No ${businessDay}º dia útil`,
            before: 'No',
            after: 'dia útil',
            picker: (
              <Select
                size="inline"
                title="Dia útil"
                aria-label={`Dia útil: ${businessDay}º`}
                options={BUSINESS_DAYS}
                value={businessDay}
                onChange={(event) => {
                  setBusinessDay(event.target.value)
                  setRule('businessDay')
                }}
              />
            ),
          },
          {
            value: 'sameDay',
            label: 'No mesmo dia da primeira data',
            before: 'No mesmo dia da primeira data',
          },
        ]}
      />
    </div>
  )
}

export const radioSentenceListExamples: ComponentExamples = {
  component: 'RadioSentenceList',
  examples: [
    { name: 'No dia do mês', render: () => <DayRule initial="day" /> },
    { name: 'No dia útil', render: () => <DayRule initial="businessDay" /> },
  ],
}

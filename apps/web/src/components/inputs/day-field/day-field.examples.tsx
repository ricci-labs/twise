import { DayField } from '@web/components/inputs/day-field/day-field'
import type { DayFieldProps } from '@web/components/inputs/day-field/day-field.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example({ value: initial }: Pick<DayFieldProps, 'value'>) {
  const [value, setValue] = useState(initial)
  return (
    <div className="w-full max-w-44">
      <DayField
        aria-label="Dia do fechamento"
        title="Dia do fechamento"
        summary={(day) => `Fecha todo dia **${day}**`}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  )
}

function InSentence() {
  const [value, setValue] = useState('10')
  return (
    <p className="flex items-center gap-1.5 text-choice text-ink">
      No dia
      <DayField
        size="inline"
        aria-label={`Dia do mês: ${value}`}
        title="Dia do mês"
        summary={(day) => `No dia **${day}** do mês`}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      do mês
    </p>
  )
}

export const dayFieldExamples: ComponentExamples = {
  component: 'DayField',
  examples: [
    { name: 'Sem dia', render: () => <Example value="" /> },
    { name: 'Dia 25', render: () => <Example value="25" /> },
    { name: 'Dentro de uma frase', render: () => <InSentence /> },
  ],
}

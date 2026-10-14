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

export const dayFieldExamples: ComponentExamples = {
  component: 'DayField',
  examples: [
    { name: 'Sem dia', render: () => <Example value="" /> },
    { name: 'Dia 25', render: () => <Example value="25" /> },
  ],
}

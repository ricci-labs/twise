import { DateInput } from '@web/components/inputs/date-input/date-input'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  return (
    <div className="flex w-full max-w-100 flex-col gap-2">
      <label htmlFor={`first-date-${initial}`} className="text-label text-ink">
        Primeira data
      </label>
      <DateInput
        id={`first-date-${initial}`}
        title="Primeira data"
        today="2026-10-20"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  )
}

export const dateInputExamples: ComponentExamples = {
  component: 'DateInput',
  examples: [
    { name: 'Com data', render: () => <Example initial="2026-11-10" /> },
    { name: 'Sem data', render: () => <Example initial="" /> },
  ],
}

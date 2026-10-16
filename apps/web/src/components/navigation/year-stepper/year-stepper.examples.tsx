import { YearStepper } from '@web/components/navigation/year-stepper/year-stepper'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Stepper({ start }: { start: number }) {
  const [year, setYear] = useState(start)
  return <YearStepper value={year} min={2000} max={2100} onChange={setYear} />
}

export const yearStepperExamples: ComponentExamples = {
  component: 'YearStepper',
  examples: [
    { name: 'O ano com as setas', render: () => <Stepper start={2026} /> },
    { name: 'No último ano possível', render: () => <Stepper start={2100} /> },
  ],
}

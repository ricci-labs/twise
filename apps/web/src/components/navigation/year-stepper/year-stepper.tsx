import { yearStepperMessages as messages } from '@web/components/navigation/year-stepper/year-stepper.messages'
import type { YearStepperProps } from '@web/components/navigation/year-stepper/year-stepper.types'
import {
  yearStepperStepVariants,
  yearStepperValueVariants,
  yearStepperVariants,
} from '@web/components/navigation/year-stepper/year-stepper.variants'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function YearStepper({
  value,
  min,
  max,
  onChange,
  label = messages.label,
}: YearStepperProps) {
  return (
    <nav data-slot="year-stepper" aria-label={label} className={yearStepperVariants()}>
      <button
        type="button"
        aria-label={messages.previous}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={yearStepperStepVariants()}
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <span aria-live="polite" className={yearStepperValueVariants()}>
        {value}
      </span>
      <button
        type="button"
        aria-label={messages.next}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={yearStepperStepVariants()}
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </nav>
  )
}

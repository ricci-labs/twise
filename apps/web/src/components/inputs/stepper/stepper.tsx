import { RichText } from '@web/components/display/rich-text'
import { stepperMessages as messages } from '@web/components/inputs/stepper/stepper.messages'
import type { StepperProps } from '@web/components/inputs/stepper/stepper.types'
import {
  stepperAsideVariants,
  stepperButtonVariants,
  stepperRowVariants,
  stepperValueVariants,
  stepperVariants,
} from '@web/components/inputs/stepper/stepper.variants'

export function Stepper({
  id,
  value,
  min,
  max,
  onChange,
  valueText,
  decreaseLabel,
  increaseLabel,
  aside,
  isDisabled = false,
  'aria-describedby': describedBy,
}: StepperProps) {
  return (
    <div data-slot="stepper" className={stepperRowVariants()}>
      <div className={stepperVariants()}>
        <button
          type="button"
          aria-label={decreaseLabel}
          disabled={isDisabled || value <= min}
          onClick={() => onChange(value - 1)}
          className={stepperButtonVariants()}
        >
          {messages.decrease}
        </button>
        <output
          id={id}
          aria-live="polite"
          aria-describedby={describedBy}
          className={stepperValueVariants()}
        >
          {valueText}
        </output>
        <button
          type="button"
          aria-label={increaseLabel}
          disabled={isDisabled || value >= max}
          onClick={() => onChange(value + 1)}
          className={stepperButtonVariants()}
        >
          {messages.increase}
        </button>
      </div>
      {aside && (
        <span className={stepperAsideVariants()}>
          <RichText text={aside} />
        </span>
      )}
    </div>
  )
}

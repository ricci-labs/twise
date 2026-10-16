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
import { useId } from 'react'

export function Stepper({
  id,
  value,
  min,
  max,
  onChange,
  valueText,
  decreaseLabel,
  increaseLabel,
  lead,
  aside,
  size,
  isDisabled = false,
  'aria-describedby': describedBy,
}: StepperProps) {
  const ownId = useId()
  const valueId = id ?? ownId
  return (
    <div data-slot="stepper" className={stepperRowVariants({ size })}>
      {lead && (
        <label htmlFor={valueId} className={stepperAsideVariants({ size })}>
          {lead}
        </label>
      )}
      <div className={stepperVariants()}>
        <button
          type="button"
          aria-label={decreaseLabel}
          disabled={isDisabled || value <= min}
          onClick={() => onChange(value - 1)}
          className={stepperButtonVariants({ size })}
        >
          {messages.decrease}
        </button>
        <output
          id={valueId}
          aria-live="polite"
          aria-describedby={describedBy}
          className={stepperValueVariants({ size })}
        >
          {valueText}
        </output>
        <button
          type="button"
          aria-label={increaseLabel}
          disabled={isDisabled || value >= max}
          onClick={() => onChange(value + 1)}
          className={stepperButtonVariants({ size })}
        >
          {messages.increase}
        </button>
      </div>
      {aside && (
        <span className={stepperAsideVariants({ size })}>
          <RichText text={aside} />
        </span>
      )}
    </div>
  )
}

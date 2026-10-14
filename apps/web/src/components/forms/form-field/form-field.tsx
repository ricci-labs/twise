import type {
  FieldErrorProps,
  FieldLabelProps,
  FieldWarningProps,
  FormFieldProps,
} from '@web/components/forms/form-field/form-field.types'
import {
  counterVariants,
  errorVariants,
  fieldVariants,
  helpVariants,
  labelVariants,
  requiredMarkVariants,
  warningVariants,
} from '@web/components/forms/form-field/form-field.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { afterPointerRelease, watchPointerPresses } from '@web/lib/forms/after-pointer-release'
import { formMessages } from '@web/lib/forms/forms.messages'
import { CircleAlert } from 'lucide-react'
import { useEffect, useId } from 'react'
import { type FieldValues, useController, useFormContext, useFormState } from 'react-hook-form'

const COUNTER_THRESHOLD = 0.8

export function FormField<Values extends FieldValues>({
  name,
  label,
  help,
  helpGap,
  warning,
  isRequired = false,
  isReadOnly = false,
  maxLength,
  children,
}: FormFieldProps<Values>) {
  const id = useId()
  useEffect(watchPointerPresses, [])
  const ids = { help: `${id}-help`, error: `${id}-error`, warning: `${id}-warning` }
  const { control } = useFormContext<Values>()
  const { isSubmitting } = useFormState({ control })
  const { field, fieldState } = useController({ name, control })
  const value = String(field.value ?? '')
  const error = fieldState.error?.message
  const shownWarning = error ? undefined : warning
  const describedBy = [help && ids.help, error && ids.error, shownWarning && ids.warning]
    .filter(Boolean)
    .join(' ')

  return (
    <div data-slot="form-field" className={fieldVariants()}>
      <FieldLabel htmlFor={id} label={label} isRequired={isRequired} />
      {help && (
        <p id={ids.help} className={helpVariants({ gap: helpGap })}>
          {help}
        </p>
      )}
      {children({
        id,
        name: field.name,
        value,
        ref: field.ref,
        onChange: field.onChange,
        onBlur: () => afterPointerRelease(field.onBlur),
        readOnly: isReadOnly || isSubmitting,
        required: isRequired,
        maxLength,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy || undefined,
      })}
      <FieldError id={ids.error} message={error} />
      <FieldWarning id={ids.warning} message={shownWarning} />
      {isNearLimit(value, maxLength) && (
        <p className={counterVariants()}>{`${value.length}/${maxLength}`}</p>
      )}
    </div>
  )
}

function FieldLabel({ htmlFor, label, isRequired }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={labelVariants()}>
      {label}
      {isRequired && (
        <span aria-hidden="true" className={requiredMarkVariants()}>
          {formMessages.requiredMark}
        </span>
      )}
    </label>
  )
}

function FieldWarning({ id, message }: FieldWarningProps) {
  return (
    <p id={id} className={warningVariants()} aria-live="polite">
      {message && (
        <>
          <TwiseIcon name="warn" tone="warning" />
          {message}
        </>
      )}
    </p>
  )
}

function FieldError({ id, message }: FieldErrorProps) {
  return (
    <p id={id} className={errorVariants()} aria-live="polite">
      {message && (
        <>
          <CircleAlert aria-hidden="true" />
          {message}
        </>
      )}
    </p>
  )
}

function isNearLimit(value: string, maxLength: number | undefined): boolean {
  return maxLength !== undefined && value.length >= maxLength * COUNTER_THRESHOLD
}

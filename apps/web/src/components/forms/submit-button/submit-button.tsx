import { Button } from '@web/components/actions/button'
import type { SubmitButtonProps } from '@web/components/forms/submit-button/submit-button.types'
import { type FieldErrors, useFormContext, useFormState } from 'react-hook-form'

const SERVER_ERROR = 'server'

export function SubmitButton({
  requiresChange = false,
  isBlocked = false,
  ...props
}: SubmitButtonProps) {
  const { trigger } = useFormContext()
  const { isValid, isDirty, isSubmitting, errors } = useFormState()
  const isRefusedByServer = isOnlyServerRefusal(errors)
  const isIncomplete = (!isValid && !isRefusedByServer) || (requiresChange && !isDirty)

  return (
    <Button
      {...props}
      type="submit"
      isDisabled={isIncomplete || isBlocked}
      isLoading={isSubmitting}
      onDisabledPress={() => {
        if (!isBlocked) {
          void trigger(undefined, { shouldFocus: true })
        }
      }}
    />
  )
}

function isOnlyServerRefusal(errors: FieldErrors): boolean {
  const found = Object.values(errors)
  return found.length > 0 && found.every((error) => error?.type === SERVER_ERROR)
}

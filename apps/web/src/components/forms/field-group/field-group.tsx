import type { FieldGroupProps } from '@web/components/forms/field-group/field-group.types'
import {
  fieldGroupErrorVariants,
  fieldGroupHelpVariants,
  fieldGroupLabelVariants,
  fieldGroupRequiredVariants,
  fieldGroupVariants,
} from '@web/components/forms/field-group/field-group.variants'
import { formMessages } from '@web/lib/forms/forms.messages'
import { CircleAlert } from 'lucide-react'
import { useId } from 'react'

export function FieldGroup({ label, isRequired = false, help, error, children }: FieldGroupProps) {
  const id = useId()
  const ids = { label: `${id}-label`, help: `${id}-help`, error: `${id}-error` }
  const describedBy = [help && ids.help, error && ids.error].filter(Boolean).join(' ')
  return (
    <fieldset
      data-slot="field-group"
      aria-labelledby={ids.label}
      aria-describedby={describedBy || undefined}
      className={fieldGroupVariants()}
    >
      <span id={ids.label} className={fieldGroupLabelVariants()}>
        {label}
        {isRequired && (
          <span aria-hidden="true" className={fieldGroupRequiredVariants()}>
            {formMessages.requiredMark}
          </span>
        )}
      </span>
      {help && (
        <p id={ids.help} className={fieldGroupHelpVariants()}>
          {help}
        </p>
      )}
      {children}
      {error && (
        <p id={ids.error} className={fieldGroupErrorVariants()} aria-live="polite">
          <CircleAlert aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  )
}

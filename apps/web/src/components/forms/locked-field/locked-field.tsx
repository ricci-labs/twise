import type { LockedFieldProps } from '@web/components/forms/locked-field/locked-field.types'
import {
  lockedFieldBoxVariants,
  lockedFieldHelpVariants,
  lockedFieldLabelVariants,
  lockedFieldValueVariants,
  lockedFieldVariants,
} from '@web/components/forms/locked-field/locked-field.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { useId } from 'react'

export function LockedField({ label, value, help }: LockedFieldProps) {
  const labelId = useId()
  const helpId = useId()
  return (
    <fieldset
      data-slot="locked-field"
      aria-labelledby={labelId}
      aria-describedby={help ? helpId : undefined}
      className={lockedFieldVariants()}
    >
      <span id={labelId} className={lockedFieldLabelVariants()}>
        {label}
      </span>
      <div className={lockedFieldBoxVariants()}>
        <TwiseIcon name="lock" size="sm" />
        <span className={lockedFieldValueVariants()}>{value}</span>
      </div>
      {help && (
        <p id={helpId} className={lockedFieldHelpVariants()}>
          {help}
        </p>
      )}
    </fieldset>
  )
}

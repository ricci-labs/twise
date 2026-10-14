import { pickerFieldMessages as messages } from '@web/components/inputs/picker-field/picker-field.messages'
import type { PickerFieldProps } from '@web/components/inputs/picker-field/picker-field.types'
import {
  pickerDetailVariants,
  pickerEmptyArtVariants,
  pickerFieldVariants,
  pickerSeparatorVariants,
  pickerTextVariants,
  pickerValueVariants,
} from '@web/components/inputs/picker-field/picker-field.variants'
import { cn } from '@web/lib/cn'
import { ChevronDown, Plus } from 'lucide-react'

export function PickerField({
  value,
  parentLabel,
  detail,
  art,
  placeholder,
  className,
  ...props
}: PickerFieldProps) {
  const isEmpty = value === null
  return (
    <button
      type="button"
      data-slot="picker-field"
      aria-haspopup="dialog"
      className={cn(pickerFieldVariants(), className)}
      {...props}
    >
      {isEmpty ? (
        <span aria-hidden="true" className={pickerEmptyArtVariants()}>
          <Plus />
        </span>
      ) : (
        art
      )}
      <span className={pickerTextVariants()}>
        <span className={pickerValueVariants({ isEmpty })}>
          {!isEmpty && parentLabel && (
            <>
              {parentLabel}
              <span className={pickerSeparatorVariants()}>{messages.pathSeparator}</span>
            </>
          )}
          {value ?? placeholder}
        </span>
        {!isEmpty && detail && <span className={pickerDetailVariants()}>{detail}</span>}
      </span>
      <ChevronDown data-slot="picker-chevron" aria-hidden="true" />
    </button>
  )
}

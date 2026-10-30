import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import type { RadioSentenceListProps } from '@web/components/inputs/radio-sentence-list/radio-sentence-list.types'
import {
  radioSentenceDotVariants,
  radioSentenceListVariants,
  radioSentencePickerVariants,
  radioSentenceRadioVariants,
  radioSentenceTextVariants,
  radioSentenceVariants,
} from '@web/components/inputs/radio-sentence-list/radio-sentence-list.variants'
import { cn } from '@web/lib/cn'

export function RadioSentenceList({
  label,
  options,
  value,
  onSelect,
  onBlur,
  disabled = false,
  className,
}: RadioSentenceListProps) {
  return (
    <RadioGroup
      data-slot="radio-sentence-list"
      aria-label={label}
      value={value}
      disabled={disabled}
      onValueChange={(next) => onSelect(String(next))}
      className={cn(radioSentenceListVariants(), className)}
    >
      {options.map((option) => (
        <div key={option.value} data-slot="radio-sentence" className={radioSentenceVariants()}>
          <Radio.Root
            data-slot="radio-sentence-radio"
            value={option.value}
            nativeButton
            render={<button type="button" onBlur={onBlur} />}
            aria-label={option.label}
            className={radioSentenceRadioVariants()}
          >
            <span aria-hidden="true" className={radioSentenceDotVariants()} />
          </Radio.Root>
          <span className={radioSentenceTextVariants()}>
            <span aria-hidden="true">{option.before}</span>
            {option.picker && (
              <span className={radioSentencePickerVariants()}>{option.picker}</span>
            )}
            {option.after && <span aria-hidden="true">{option.after}</span>}
          </span>
        </div>
      ))}
    </RadioGroup>
  )
}

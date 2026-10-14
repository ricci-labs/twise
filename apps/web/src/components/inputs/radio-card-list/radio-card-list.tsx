import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { Badge } from '@web/components/display/badge'
import { RichText } from '@web/components/display/rich-text'
import type { RadioCardListProps } from '@web/components/inputs/radio-card-list/radio-card-list.types'
import {
  radioCardDetailVariants,
  radioCardListVariants,
  radioCardTextVariants,
  radioCardVariants,
  radioDotVariants,
} from '@web/components/inputs/radio-card-list/radio-card-list.variants'
import { cn } from '@web/lib/cn'

export function RadioCardList({
  label,
  options,
  value,
  onSelect,
  onBlur,
  className,
}: RadioCardListProps) {
  return (
    <RadioGroup
      data-slot="radio-card-list"
      aria-label={label}
      value={value}
      onValueChange={(next) => onSelect(String(next))}
      className={cn(radioCardListVariants(), className)}
    >
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          nativeButton
          render={<button type="button" onBlur={onBlur} />}
          className={radioCardVariants()}
        >
          <span aria-hidden="true" className={radioDotVariants()} />
          <span className={radioCardTextVariants()}>
            {option.label}
            {option.detail && (
              <span className={radioCardDetailVariants()}>
                <RichText text={option.detail} />
              </span>
            )}
          </span>
          {option.badge && <Badge tone={option.badge.tone}>{option.badge.label}</Badge>}
        </Radio.Root>
      ))}
    </RadioGroup>
  )
}

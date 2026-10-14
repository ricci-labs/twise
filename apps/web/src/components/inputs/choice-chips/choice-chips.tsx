import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { Avatar } from '@web/components/display/avatar'
import type {
  ChipContentProps,
  ChoiceChipsProps,
} from '@web/components/inputs/choice-chips/choice-chips.types'
import {
  choiceChipLabelVariants,
  choiceChipsVariants,
  choiceChipVariants,
} from '@web/components/inputs/choice-chips/choice-chips.variants'
import { cn } from '@web/lib/cn'
import { Calendar, ChevronDown } from 'lucide-react'

export function ChoiceChips({
  label,
  options,
  value,
  onSelect,
  onBlur,
  variant,
  isDisabled = false,
  className,
}: ChoiceChipsProps) {
  return (
    <RadioGroup
      data-slot="choice-chips"
      aria-label={label}
      value={value}
      disabled={isDisabled}
      onValueChange={(next) => onSelect(String(next))}
      className={cn(choiceChipsVariants({ variant }), className)}
    >
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          nativeButton
          render={<button type="button" onBlur={onBlur} />}
          aria-haspopup={option.opensDialog ? 'dialog' : undefined}
          onClick={() => {
            if (option.value === value) {
              onSelect(option.value)
            }
          }}
          className={choiceChipVariants({ variant })}
        >
          <ChipContent option={option} avatarSize={variant === 'member' ? 'xs' : 'sm'} />
        </Radio.Root>
      ))}
    </RadioGroup>
  )
}

function ChipContent({ option, avatarSize }: ChipContentProps) {
  return (
    <>
      {option.avatarName && (
        <Avatar
          name={option.avatarName}
          icon={option.avatarIcon}
          tone={option.avatarIcon ? 'paper' : 'mint'}
          size={avatarSize}
        />
      )}
      {option.icon === 'calendar' && <Calendar data-slot="chip-icon" aria-hidden="true" />}
      <span className={choiceChipLabelVariants()}>{option.label}</span>
      {option.icon === 'chevron' && <ChevronDown data-slot="chip-icon" aria-hidden="true" />}
    </>
  )
}

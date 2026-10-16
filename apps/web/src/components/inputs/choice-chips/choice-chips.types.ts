import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type {
  choiceChipsVariants,
  choiceChipVariants,
} from '@web/components/inputs/choice-chips/choice-chips.variants'
import type { VariantProps } from 'class-variance-authority'
import type { Ref } from 'react'

export type ChoiceChipIcon = 'calendar' | 'chevron'

export type ChoiceChip = {
  value: string
  label: string
  icon?: ChoiceChipIcon
  avatarName?: string
  avatarIcon?: TwiseIconName
  opensDialog?: boolean
  buttonRef?: Ref<HTMLButtonElement>
}

export type ChoiceChipsProps = VariantProps<typeof choiceChipsVariants> &
  Pick<VariantProps<typeof choiceChipVariants>, 'size'> & {
    label: string
    options: readonly ChoiceChip[]
    value: string
    onSelect: (value: string) => void
    onBlur?: () => void
    isDisabled?: boolean
    className?: string
  }

export type ChipContentProps = {
  option: ChoiceChip
  avatarSize: 'xs' | 'sm'
}

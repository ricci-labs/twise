import type { illustrationPickerMessages } from '@web/components/inputs/illustration-picker/illustration-picker.messages'

export type Illustration = keyof typeof illustrationPickerMessages.names

export type IllustrationPickerProps = {
  label: string
  name: string
  value: string
  onSelect: (illustration: string) => void
  onBlur?: () => void
  isDisabled?: boolean
}

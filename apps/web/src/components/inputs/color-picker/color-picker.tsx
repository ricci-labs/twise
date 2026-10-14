import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { colorPickerMessages as messages } from '@web/components/inputs/color-picker/color-picker.messages'
import type { ColorPickerProps } from '@web/components/inputs/color-picker/color-picker.types'
import {
  colorNoneVariants,
  colorOptionVariants,
  colorPickerVariants,
} from '@web/components/inputs/color-picker/color-picker.variants'
import { ColorSwatch } from '@web/components/inputs/color-swatch'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'

const NO_COLOR = ''

export function ColorPicker({
  label,
  value,
  onSelect,
  onBlur,
  isDisabled = false,
}: ColorPickerProps) {
  return (
    <RadioGroup
      data-slot="color-picker"
      aria-label={label}
      value={value}
      disabled={isDisabled}
      onValueChange={(next) => onSelect(String(next))}
      className={colorPickerVariants()}
    >
      <Radio.Root
        value={NO_COLOR}
        nativeButton
        render={<button type="button" onBlur={onBlur} />}
        aria-label={messages.none}
        className={colorOptionVariants()}
      >
        <svg viewBox="0 0 36 36" aria-hidden="true" className={colorNoneVariants()}>
          <circle cx="18" cy="18" r="17.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M26.5 9.5 9.5 26.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </Radio.Root>
      {ACCOUNT_COLORS.map((color) => (
        <Radio.Root
          key={color.key}
          value={color.value}
          nativeButton
          render={<button type="button" onBlur={onBlur} />}
          aria-label={messages.names[color.key]}
          title={messages.names[color.key]}
          className={colorOptionVariants()}
        >
          <ColorSwatch color={color.value} size="swatch" />
        </Radio.Root>
      ))}
    </RadioGroup>
  )
}

import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { CategoryArt } from '@web/components/display/category-art'
import { illustrationPickerMessages as messages } from '@web/components/inputs/illustration-picker/illustration-picker.messages'
import type {
  Illustration,
  IllustrationPickerProps,
} from '@web/components/inputs/illustration-picker/illustration-picker.types'
import {
  illustrationLetterVariants,
  illustrationPickerVariants,
  illustrationTileVariants,
} from '@web/components/inputs/illustration-picker/illustration-picker.variants'

const NO_ILLUSTRATION = ''

const ILLUSTRATIONS = Object.keys(messages.names) as Illustration[]

export function IllustrationPicker({
  label,
  name,
  value,
  onSelect,
  onBlur,
  isDisabled = false,
}: IllustrationPickerProps) {
  return (
    <RadioGroup
      data-slot="illustration-picker"
      aria-label={label}
      value={value}
      disabled={isDisabled}
      onValueChange={(next) => onSelect(String(next))}
      className={illustrationPickerVariants()}
    >
      <Radio.Root
        value={NO_ILLUSTRATION}
        nativeButton
        render={<button type="button" onBlur={onBlur} />}
        aria-label={messages.initial}
        className={illustrationTileVariants()}
      >
        <span aria-hidden="true" className={illustrationLetterVariants()}>
          {initialOf(name)}
        </span>
      </Radio.Root>
      {ILLUSTRATIONS.map((illustration) => (
        <Radio.Root
          key={illustration}
          value={illustration}
          nativeButton
          render={<button type="button" onBlur={onBlur} />}
          aria-label={messages.names[illustration]}
          title={messages.names[illustration]}
          className={illustrationTileVariants()}
        >
          <CategoryArt
            name={messages.names[illustration]}
            icon={illustration}
            variant="onLight"
            size="fill"
          />
        </Radio.Root>
      ))}
    </RadioGroup>
  )
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase('pt-BR')
}

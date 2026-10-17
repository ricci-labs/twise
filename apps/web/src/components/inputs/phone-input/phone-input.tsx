import { phoneInputMessages } from '@web/components/inputs/phone-input/phone-input.messages'
import type { PhoneInputProps } from '@web/components/inputs/phone-input/phone-input.types'
import {
  phoneCountryVariants,
  phoneInputVariants,
  phoneNumberVariants,
} from '@web/components/inputs/phone-input/phone-input.variants'
import { Select } from '@web/components/inputs/select'
import { TextInput } from '@web/components/inputs/text-input'
import { cn } from '@web/lib/cn'
import { BRAZIL_CALLING_CODE, CALLING_CODES, tidyPhoneNumber } from '@web/lib/format/phone'

const COUNTRY_OPTIONS = CALLING_CODES.map((callingCode) => ({
  value: callingCode,
  label: phoneInputMessages.option(phoneInputMessages.countries[callingCode], callingCode),
  fieldLabel: callingCode,
}))

export function PhoneInput({
  value,
  onChange,
  onBlur,
  callingCode,
  onCallingCodeChange,
  readOnly,
  className,
  placeholder,
  ...props
}: PhoneInputProps) {
  const isBrazil = callingCode === BRAZIL_CALLING_CODE
  return (
    <div data-slot="phone-input" className={cn(phoneInputVariants(), className)}>
      <Select
        title={phoneInputMessages.country}
        aria-label={phoneInputMessages.countryValue(callingCode)}
        options={COUNTRY_OPTIONS}
        value={callingCode}
        disabled={readOnly}
        onChange={(event) => onCallingCodeChange(event.target.value)}
        className={phoneCountryVariants()}
      />
      <TextInput
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={value}
        readOnly={readOnly}
        placeholder={placeholder ?? (isBrazil ? phoneInputMessages.brazilPlaceholder : undefined)}
        onChange={(event) => onChange({ target: { value: event.target.value } })}
        onBlur={(event) => {
          const tidy = tidyPhoneNumber({ callingCode, number: event.target.value })
          if (tidy !== event.target.value) {
            onChange({ target: { value: tidy } })
          }
          onBlur?.(event)
        }}
        className={phoneNumberVariants()}
        {...props}
      />
    </div>
  )
}

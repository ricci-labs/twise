import type { ComponentProps } from 'react'

export type PhoneInputChange = { target: { value: string } }

export type PhoneInputProps = Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type'> & {
  value: string
  onChange: (event: PhoneInputChange) => void
  callingCode: string
  onCallingCodeChange: (callingCode: string) => void
}

export type PhoneInputExampleProps = {
  initialCallingCode?: string
  initialNumber?: string
  isInvalid?: boolean
}

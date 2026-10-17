import { FormField } from '@web/components/forms/form-field'
import { PhoneInput } from '@web/components/inputs/phone-input'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type { ContactFormInput } from '@web/features/contacts/contacts.types'
import { useController, useFormContext } from 'react-hook-form'

const messages = contactsMessages.form

export function ContactPhoneField() {
  const { control, getFieldState, trigger } = useFormContext<ContactFormInput>()
  const { field: country } = useController({ control, name: 'callingCode' })

  function changeCountry(callingCode: string) {
    country.onChange(callingCode)
    if (getFieldState('phone').isTouched) {
      void trigger('phone')
    }
  }

  return (
    <FormField<ContactFormInput>
      name="phone"
      label={messages.phone}
      help={messages.phoneHelp}
      helpGap="roomy"
    >
      {(phone) => (
        <PhoneInput {...phone} callingCode={country.value} onCallingCodeChange={changeCountry} />
      )}
    </FormField>
  )
}

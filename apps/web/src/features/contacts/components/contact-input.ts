import type { ContactChange, NewContact } from '@financas/shared'
import type {
  Contact,
  ContactFormDirtyFields,
  ContactFormInput,
  ContactFormValues,
} from '@web/features/contacts/contacts.types'
import { phoneE164Of, phonePartsOf } from '@web/lib/format/phone'

export function contactDefaultsOf(contact: Contact | null): ContactFormInput {
  const { callingCode, number } = phonePartsOf(contact?.phoneE164 ?? null)
  return {
    name: contact?.name ?? '',
    callingCode,
    phone: number,
    email: contact?.email ?? '',
    pixKey: contact?.pixKey ?? '',
    notes: contact?.notes ?? '',
    isOptedOut: contact?.isOptedOut ?? false,
  }
}

export function newContactOf(values: ContactFormValues): NewContact {
  return {
    name: values.name,
    phoneE164: phoneOf(values),
    email: values.email || null,
    pixKey: values.pixKey || null,
    notes: values.notes || null,
  }
}

export function contactChangeOf(
  values: ContactFormValues,
  dirty: ContactFormDirtyFields,
): ContactChange {
  return {
    ...(dirty.name && { name: values.name }),
    ...((dirty.phone || dirty.callingCode) && { phoneE164: phoneOf(values) }),
    ...(dirty.email && { email: values.email || null }),
    ...(dirty.pixKey && { pixKey: values.pixKey || null }),
    ...(dirty.notes && { notes: values.notes || null }),
    ...(dirty.isOptedOut && { isOptedOut: values.isOptedOut }),
  }
}

function phoneOf({ callingCode, phone }: ContactFormValues): string | null {
  return phone.trim() === '' ? null : phoneE164Of({ callingCode, number: phone })
}

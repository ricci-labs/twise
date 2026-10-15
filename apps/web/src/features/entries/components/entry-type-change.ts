import { hasCategory } from '@web/features/entries/components/entry-kind'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { EntryForm, EntryFormInput, FormEntryType } from '@web/features/entries/entries.types'

const OPENING_BALANCE = 'opening_balance'
const CARD_PURCHASE = 'card_purchase'
const CREDIT = 'credit'

export function changeEntryType(form: EntryForm, current: FormEntryType, next: FormEntryType) {
  if (categoryKindOf(next) !== categoryKindOf(current)) {
    form.setValue('categoryId', '', { shouldDirty: true })
  }
  form.setValue('entryType', next, { shouldDirty: true })
  form.setValue('paymentMethod', paymentMethodFor(next, form.getValues('paymentMethod')))
  if (next === OPENING_BALANCE && form.getValues('description').trim() === '') {
    form.setValue('description', entriesMessages.newEntry.openingDescription)
  }
}

function paymentMethodFor(
  entryType: FormEntryType,
  current: EntryFormInput['paymentMethod'],
): EntryFormInput['paymentMethod'] {
  if (entryType === CARD_PURCHASE) {
    return current === '' ? CREDIT : current
  }
  return current === CREDIT ? '' : current
}

function categoryKindOf(entryType: FormEntryType): string | undefined {
  if (!hasCategory(entryType)) {
    return undefined
  }
  return entryType === 'income' ? 'income' : 'expense'
}

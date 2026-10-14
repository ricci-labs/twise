import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  AutoFill,
  AutoFillControls,
  AutoFillField,
  AutoFillSnapshot,
  EntryForm,
  EntryFormInput,
  EntrySuggestion,
} from '@web/features/entries/entries.types'
import { formatTypedAmount } from '@web/lib/format/money'
import type { RefObject } from 'react'
import { useState } from 'react'

const messages = entriesMessages.autoFill
const CARD_PURCHASE = 'card_purchase'
const CHANGED = { shouldDirty: true, shouldValidate: true }

export function useAutoFill(
  form: EntryForm,
  amountInput: RefObject<HTMLInputElement | null>,
): AutoFillControls {
  const [autoFill, setAutoFill] = useState<AutoFill | null>(null)

  function apply(suggestion: EntrySuggestion, withAmount: boolean) {
    const snapshot = autoFill?.snapshot ?? snapshotOf(form.getValues())
    const account = form.getValues('entryType') === CARD_PURCHASE ? 'cardAccountId' : 'accountId'
    write(form, suggestion, account, withAmount)
    setAutoFill({
      place: withAmount ? 'amount' : 'description',
      text: withAmount ? messages.recent : sentenceOf(filledFields(suggestion, account)),
      pickedKey: withAmount ? suggestion.description : null,
      snapshot,
    })
  }

  function undo() {
    if (autoFill) {
      restore(form, autoFill.snapshot)
    }
    setAutoFill(null)
  }

  return {
    autoFill,
    fillFromSuggestion: (suggestion) => {
      apply(suggestion, false)
      form.setFocus('amount')
    },
    repeatRecent: (suggestion) => {
      apply(suggestion, true)
      amountInput.current?.focus()
      amountInput.current?.select()
    },
    undo,
    forget: () => setAutoFill(null),
  }
}

function write(
  form: EntryForm,
  suggestion: EntrySuggestion,
  account: AutoFillField,
  withAmount: boolean,
) {
  form.setValue('description', suggestion.description, CHANGED)
  if (suggestion.categoryId) {
    form.setValue('categoryId', suggestion.categoryId, CHANGED)
  }
  if (suggestion.accountId) {
    form.setValue(account, suggestion.accountId, CHANGED)
  }
  if (suggestion.paymentMethod) {
    form.setValue('paymentMethod', suggestion.paymentMethod, CHANGED)
  }
  if (withAmount) {
    form.setValue('amount', formatTypedAmount(suggestion.lastAmountCents), CHANGED)
  }
}

function restore(form: EntryForm, snapshot: AutoFillSnapshot) {
  form.setValue('amount', snapshot.amount)
  form.setValue('description', snapshot.description)
  form.setValue('categoryId', snapshot.categoryId)
  form.setValue('accountId', snapshot.accountId)
  form.setValue('cardAccountId', snapshot.cardAccountId)
  form.setValue('paymentMethod', snapshot.paymentMethod)
}

function snapshotOf(values: EntryFormInput): AutoFillSnapshot {
  return {
    amount: values.amount,
    description: values.description,
    categoryId: values.categoryId,
    accountId: values.accountId,
    cardAccountId: values.cardAccountId,
    paymentMethod: values.paymentMethod,
  }
}

function filledFields(suggestion: EntrySuggestion, account: AutoFillField): AutoFillField[] {
  return [
    ...(suggestion.categoryId ? (['categoryId'] as const) : []),
    ...(suggestion.accountId ? [account] : []),
    ...(suggestion.paymentMethod ? (['paymentMethod'] as const) : []),
  ]
}

function sentenceOf(fields: readonly AutoFillField[]): string {
  const parts = fields.map((field) => messages.parts[field])
  const last = parts.at(-1) ?? ''
  const listed =
    parts.length > 1 ? `${parts.slice(0, -1).join(messages.comma)}${messages.and}${last}` : last
  return messages.lastTime(listed.charAt(0).toLocaleUpperCase('pt-BR') + listed.slice(1))
}

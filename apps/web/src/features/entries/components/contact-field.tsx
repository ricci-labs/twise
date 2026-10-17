import { formatBrl } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { FormField } from '@web/components/forms/form-field'
import type { PickerItem } from '@web/components/inputs/picker-sheet'
import {
  contactBalancesQueryOptions,
  contactsQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { EntryPicker } from '@web/features/entries/components/entry-picker'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  ContactBalance,
  ContactFieldProps,
  EntryContact,
  EntryFormInput,
} from '@web/features/entries/entries.types'
import {
  useCreatedContact,
  useNewContactForm,
} from '@web/features/entries/hooks/use-created-contact'
import { formatShortDate } from '@web/lib/format/calendar'
import { formatTypedAmount } from '@web/lib/format/money'
import { useCallback, useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

const messages = entriesMessages.settlements
const NEW_CONTACT = entriesMessages.shares.newContact
const EMPTY = {
  icon: 'together',
  title: entriesMessages.shares.empty.title,
  text: entriesMessages.shares.empty.text,
}

export function ContactField({ workspaceId, canCreateContacts }: ContactFieldProps) {
  const contacts = (useQuery(contactsQueryOptions(workspaceId)).data ?? []).filter(
    (contact) => !contact.isArchived,
  )
  const balances = useQuery(contactBalancesQueryOptions(workspaceId)).data ?? []
  const balanceOf = new Map(balances.map((balance) => [balance.contactId, balance]))
  const contactId = useWatch<EntryFormInput, 'contactId'>({ name: 'contactId' })
  const chosen = contacts.find((contact) => contact.id === contactId)
  useSettlementDefaults(chosen?.name, balanceOf.get(contactId))
  usePickCreatedContact()
  const openNewContact = useNewContactForm()

  return (
    <FormField<EntryFormInput> name="contactId" label={entriesMessages.fields.contact} isRequired>
      {(control) => (
        <EntryPicker
          control={control}
          title={entriesMessages.fields.contact}
          placeholder={messages.placeholder}
          searchLabel={entriesMessages.shares.search}
          items={byMostOwed(contacts, balanceOf).map((contact) =>
            itemOf(contact.id, contact.name, balanceOf.get(contact.id)),
          )}
          empty={
            canCreateContacts
              ? { ...EMPTY, actionLabel: NEW_CONTACT, onAction: openNewContact }
              : EMPTY
          }
          action={canCreateContacts ? { label: NEW_CONTACT, onPress: openNewContact } : undefined}
        />
      )}
    </FormField>
  )
}

function usePickCreatedContact() {
  const { setValue } = useFormContext<EntryFormInput>()
  const pick = useCallback(
    (contactId: string) =>
      setValue('contactId', contactId, { shouldDirty: true, shouldValidate: true }),
    [setValue],
  )
  useCreatedContact(pick)
}

function byMostOwed(
  contacts: readonly EntryContact[],
  balanceOf: ReadonlyMap<string, ContactBalance>,
): EntryContact[] {
  const owed = (contact: EntryContact) => balanceOf.get(contact.id)
  return [...contacts].sort(
    (first, second) =>
      (owed(second)?.overdueCents ?? 0) - (owed(first)?.overdueCents ?? 0) ||
      (owed(second)?.owedCents ?? 0) - (owed(first)?.owedCents ?? 0),
  )
}

function itemOf(id: string, name: string, balance: ContactBalance | undefined): PickerItem {
  const owes = balance && balance.owedCents > 0 ? balance : undefined
  return {
    value: id,
    label: name,
    isPerson: true,
    isDetailStrong: true,
    detail: owes && messages.owes(formatBrl(owes.owedCents)),
    fieldDetail: owes && fieldDetailOf(owes),
    end: owes && endOf(owes),
  }
}

function fieldDetailOf(balance: ContactBalance): string {
  const owed = formatBrl(balance.owedCents)
  return balance.nextDueOn
    ? messages.owesUntil(owed, formatShortDate(balance.nextDueOn))
    : messages.owes(owed)
}

function endOf(balance: ContactBalance): PickerItem['end'] {
  if (balance.overdueCents > 0) {
    return { label: messages.overdue(formatBrl(balance.overdueCents)), tone: 'danger' }
  }
  return balance.nextDueOn ? { label: messages.due(formatShortDate(balance.nextDueOn)) } : undefined
}

function useSettlementDefaults(name: string | undefined, balance: ContactBalance | undefined) {
  const { getValues, resetField } = useFormContext<EntryFormInput>()
  const filled = useRef({ amount: '', description: '' })
  const owedCents = balance?.owedCents ?? 0

  useEffect(() => {
    if (!name) {
      return
    }
    const next = {
      amount: owedCents > 0 ? formatTypedAmount(owedCents) : '',
      description: messages.paid(name),
    }
    for (const field of ['amount', 'description'] as const) {
      const current = getValues(field)
      if (current === '' || current === filled.current[field]) {
        resetField(field, { defaultValue: next[field] })
      }
    }
    filled.current = next
  }, [name, owedCents, getValues, resetField])
}

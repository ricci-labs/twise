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
  EntryFormInput,
} from '@web/features/entries/entries.types'
import { formatShortDate } from '@web/lib/format/calendar'
import { formatTypedAmount } from '@web/lib/format/money'
import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

const messages = entriesMessages.settlements
const EMPTY = {
  icon: 'together',
  title: entriesMessages.shares.empty.title,
  text: entriesMessages.shares.empty.text,
}

export function ContactField({ workspaceId }: ContactFieldProps) {
  const contacts = (useQuery(contactsQueryOptions(workspaceId)).data ?? []).filter(
    (contact) => !contact.isArchived,
  )
  const balances = useQuery(contactBalancesQueryOptions(workspaceId)).data ?? []
  const balanceOf = new Map(balances.map((balance) => [balance.contactId, balance]))
  const contactId = useWatch<EntryFormInput, 'contactId'>({ name: 'contactId' })
  const chosen = contacts.find((contact) => contact.id === contactId)
  useSettlementDefaults(chosen?.name, balanceOf.get(contactId))

  return (
    <FormField<EntryFormInput> name="contactId" label={entriesMessages.fields.contact} isRequired>
      {(control) => (
        <EntryPicker
          control={control}
          title={entriesMessages.fields.contact}
          placeholder={messages.placeholder}
          searchLabel={entriesMessages.shares.search}
          items={contacts.map((contact) =>
            itemOf(contact.id, contact.name, balanceOf.get(contact.id)),
          )}
          empty={EMPTY}
        />
      )}
    </FormField>
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

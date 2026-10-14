import { equalShares, halfShares, MAX_SHARES_PER_ENTRY } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { SharesCollapsed, SharesList } from '@web/components/finance/shares-list'
import { FieldGroup } from '@web/components/forms/field-group'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import { contactsQueryOptions } from '@web/features/entries/api/entries.queries'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  EntryFormInput,
  EntryShareInput,
  QuickFill,
  SharesFieldProps,
} from '@web/features/entries/entries.types'
import { centsOfTypedAmount, formatTypedAmount } from '@web/lib/format/money'
import { useRef, useState } from 'react'
import { useController } from 'react-hook-form'

const messages = entriesMessages.shares
const EMPTY = { icon: 'together', title: messages.empty.title, text: messages.empty.text }

export function SharesField({ workspaceId, yoursName, totals }: SharesFieldProps) {
  const [isPicking, setIsPicking] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const contacts = useQuery(contactsQueryOptions(workspaceId)).data ?? []
  const { field, fieldState } = useController<EntryFormInput, 'shares'>({ name: 'shares' })
  const shares = field.value
  const { totalCents, yoursCents, isOver } = totals
  const isFull = shares.length >= MAX_SHARES_PER_ENTRY
  const nameOf = new Map(contacts.map((contact) => [contact.id, contact.name]))
  const chosen = new Set(shares.map((share) => share.contactId))
  const active = contacts.filter((contact) => !contact.isArchived)
  const items = active
    .filter((contact) => !chosen.has(contact.id))
    .map((contact) => ({ value: contact.id, label: contact.name, isPerson: true }))

  const change = (next: EntryShareInput[]) => field.onChange(next)
  const fill = (quickFill: QuickFill) => {
    if (totalCents === null) {
      return
    }
    const cents = quickFill(totalCents, shares.length)
    change(
      shares.map((share, index) => ({ ...share, amount: formatTypedAmount(cents[index] ?? 0) })),
    )
  }
  const isInvalid = (share: EntryShareInput) =>
    isOver || (Boolean(fieldState.error) && (centsOfTypedAmount(share.amount) ?? 0) <= 0)

  const picker = (
    <PickerSheet
      title={messages.picker}
      items={items}
      value={null}
      searchLabel={messages.search}
      anchor={anchor}
      isOpen={isPicking}
      onOpenChange={setIsPicking}
      onSelect={(contactId) => change([...shares, { contactId, amount: '' }])}
      empty={active.length === 0 ? EMPTY : undefined}
    />
  )

  if (shares.length === 0) {
    return (
      <FieldGroup label={entriesMessages.fields.shares}>
        <SharesCollapsed ref={anchor} onOpen={() => setIsPicking(true)} />
        {picker}
      </FieldGroup>
    )
  }

  return (
    <>
      <SharesList
        rows={shares.map((share) => ({
          key: share.contactId,
          contactName: nameOf.get(share.contactId) ?? '',
          amountText: share.amount,
          isInvalid: isInvalid(share),
        }))}
        yoursName={yoursName}
        yoursCents={yoursCents}
        error={errorOf(isOver, fieldState.error?.message, isFull)}
        canAdd={!isFull}
        addRef={anchor}
        onAmountChange={(contactId, { target }) =>
          change(
            shares.map((share) =>
              share.contactId === contactId ? { ...share, amount: target.value } : share,
            ),
          )
        }
        onAmountBlur={field.onBlur}
        onRemove={(contactId) => change(shares.filter((share) => share.contactId !== contactId))}
        onAdd={() => setIsPicking(true)}
        onHalf={() => fill(halfShares)}
        onEqually={() => fill(equalShares)}
      />
      {picker}
    </>
  )
}

function errorOf(isOver: boolean, formError: string | undefined, isFull: boolean) {
  if (isOver) {
    return messages.exceed
  }
  return formError ?? (isFull ? messages.limit : undefined)
}

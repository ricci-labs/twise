import { formatBrl } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { FieldGroup } from '@web/components/forms/field-group'
import { RadioCardList } from '@web/components/inputs/radio-card-list'
import {
  cardInvoicesQueryOptions,
  cardsQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { AccountField } from '@web/features/entries/components/account-field'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  CardInvoice,
  EntryFormInput,
  InvoiceFieldProps,
  PaymentAccountFieldProps,
} from '@web/features/entries/entries.types'
import { formatShortDate } from '@web/lib/format/calendar'
import { formatTypedAmount } from '@web/lib/format/money'
import { useEffect, useRef } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'

const messages = entriesMessages.invoices
const TONES = { future: 'neutral', open: 'warning', closed: 'info' } as const

export function InvoiceField({ workspaceId }: InvoiceFieldProps) {
  const cardAccountId = useWatch<EntryFormInput, 'cardAccountId'>({ name: 'cardAccountId' })
  const card = useQuery(cardsQueryOptions(workspaceId)).data?.find(
    (item) => item.accountId === cardAccountId,
  )
  const invoices = (useQuery(cardInvoicesQueryOptions(workspaceId, cardAccountId)).data ?? [])
    .filter((invoice) => invoice.dueCents > 0)
    .sort((first, second) => first.dueOn.localeCompare(second.dueOn))
  const { field, fieldState } = useController<EntryFormInput, 'invoiceId'>({ name: 'invoiceId' })
  const chosen = invoices.find((invoice) => invoice.invoiceId === field.value)
  useInvoiceDefaults(invoices[0], chosen, card?.name)
  useCardPaymentAccount(card?.paymentAccountId ?? null)

  return (
    <FieldGroup label={entriesMessages.fields.invoice} isRequired error={fieldState.error?.message}>
      {invoices.length === 0 ? (
        <p className="text-body-sm text-ink-muted">{messages.none}</p>
      ) : (
        <RadioCardList
          label={entriesMessages.fields.invoice}
          value={chosen?.invoiceId ?? null}
          onSelect={field.onChange}
          onBlur={field.onBlur}
          options={invoices.map((invoice) => ({
            value: invoice.invoiceId,
            label: messages.due(formatShortDate(invoice.dueOn)),
            detail: messages.left(formatBrl(invoice.dueCents)),
            badge: { label: messages.states[invoice.status], tone: TONES[invoice.status] },
          }))}
        />
      )}
    </FieldGroup>
  )
}

function useInvoiceDefaults(
  oldest: CardInvoice | undefined,
  chosen: CardInvoice | undefined,
  cardName: string | undefined,
) {
  const { getValues, resetField } = useFormContext<EntryFormInput>()
  const filled = useRef({ amount: '', description: '' })

  useEffect(() => {
    if (!chosen && oldest) {
      resetField('invoiceId', { defaultValue: oldest.invoiceId })
    }
  }, [chosen, oldest, resetField])

  useEffect(() => {
    if (!chosen || !cardName) {
      return
    }
    const next = {
      amount: formatTypedAmount(chosen.dueCents),
      description: messages.description(cardName, formatShortDate(chosen.dueOn)),
    }
    for (const name of ['amount', 'description'] as const) {
      const current = getValues(name)
      if (current === '' || current === filled.current[name]) {
        resetField(name, { defaultValue: next[name] })
      }
    }
    filled.current = next
  }, [chosen, cardName, getValues, resetField])
}

function useCardPaymentAccount(paymentAccountId: string | null) {
  const { resetField } = useFormContext<EntryFormInput>()

  useEffect(() => {
    if (paymentAccountId) {
      resetField('accountId', { defaultValue: paymentAccountId })
    }
  }, [paymentAccountId, resetField])
}

export function PaymentAccountField({ workspaceId, canCreateAccounts }: PaymentAccountFieldProps) {
  const cardAccountId = useWatch<EntryFormInput, 'cardAccountId'>({ name: 'cardAccountId' })
  const card = useQuery(cardsQueryOptions(workspaceId)).data?.find(
    (item) => item.accountId === cardAccountId,
  )
  return (
    <AccountField
      workspaceId={workspaceId}
      canCreateAccounts={canCreateAccounts}
      label={entriesMessages.fields.paidFrom}
      note={
        card?.paymentAccountId
          ? { accountId: card.paymentAccountId, text: messages.cardDefault }
          : undefined
      }
    />
  )
}

import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { FormField } from '@web/components/forms/form-field'
import { cardsQueryOptions } from '@web/features/entries/api/entries.queries'
import { EntryPicker } from '@web/features/entries/components/entry-picker'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { CardFieldProps, EntryFormInput } from '@web/features/entries/entries.types'
import { formatShortDate } from '@web/lib/format/calendar'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

const messages = entriesMessages.cards

const CARD_ICON = 'card'

export function CardField({ workspaceId, canCreateCards }: CardFieldProps) {
  const navigate = useNavigate()
  const cards = (useQuery(cardsQueryOptions(workspaceId)).data ?? []).filter(
    (card) => card.archivedAt === null,
  )
  const items = cards.map((card) => ({
    value: card.accountId,
    label: card.name,
    icon: card.icon ?? CARD_ICON,
    detail: messages.cycle(
      formatShortDate(card.currentInvoice.closingOn),
      formatShortDate(card.currentInvoice.dueOn),
    ),
  }))
  useFirstCard(items[0]?.value)

  return (
    <FormField<EntryFormInput> name="cardAccountId" label={entriesMessages.fields.card} isRequired>
      {(control) => (
        <EntryPicker
          control={control}
          title={entriesMessages.fields.card}
          placeholder={messages.placeholder}
          items={items}
          empty={{
            icon: CARD_ICON,
            title: messages.empty.title,
            text: messages.empty.text,
            ...(canCreateCards && {
              actionLabel: messages.empty.action,
              onAction: () =>
                navigate({ to: '.', search: (previous) => ({ ...previous, card: 'new' }) }),
            }),
          }}
        />
      )}
    </FormField>
  )
}

function useFirstCard(firstCardId: string | undefined) {
  const { getValues, resetField } = useFormContext<EntryFormInput>()

  useEffect(() => {
    if (firstCardId && getValues('cardAccountId') === '') {
      resetField('cardAccountId', { defaultValue: firstCardId })
    }
  }, [firstCardId, getValues, resetField])
}

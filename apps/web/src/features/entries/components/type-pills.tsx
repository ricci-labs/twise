import { type ChoiceChip, ChoiceChips } from '@web/components/inputs/choice-chips'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { FormEntryType, TypePillsProps } from '@web/features/entries/entries.types'
import { useRef, useState } from 'react'

const messages = entriesMessages.newEntry
const MAIN_TYPES: readonly FormEntryType[] = ['expense', 'card_purchase', 'income', 'transfer']
const MORE_TYPES = ['invoice_payment', 'settlement', 'opening_balance'] as const
const MORE = 'more'
const DRAWINGS = {
  invoice_payment: 'invoice-paid',
  settlement: 'settlement',
  opening_balance: 'opening-balance',
} as const
const NEEDS_CONTACTS = 'settlement'
const MORE_ITEMS = MORE_TYPES.map((entryType) => ({
  value: entryType,
  label: messages.types[entryType],
  detail: messages.more.details[entryType],
  icon: DRAWINGS[entryType],
  hasChevron: true,
}))

export function TypePills({ value, canSeeContacts, onChange }: TypePillsProps) {
  const [isChoosingMore, setIsChoosingMore] = useState(false)
  const moreButton = useRef<HTMLButtonElement>(null)
  const moreType = MORE_TYPES.find((entryType) => entryType === value)
  const options: ChoiceChip[] = [
    ...MAIN_TYPES.map((entryType) => ({ value: entryType, label: messages.types[entryType] })),
    {
      value: moreType ?? MORE,
      label: moreType ? messages.types[moreType] : messages.more.label,
      icon: 'chevron',
      opensDialog: true,
      buttonRef: moreButton,
    },
  ]

  return (
    <>
      <ChoiceChips
        label={messages.typesLabel}
        className="px-4 pt-3.5 lg:px-8 lg:pt-2.5"
        options={options}
        value={value}
        onSelect={(next) => {
          const main = MAIN_TYPES.find((entryType) => entryType === next)
          if (main) {
            onChange(main)
            return
          }
          setIsChoosingMore(true)
        }}
      />
      <PickerSheet
        title={messages.more.title}
        items={MORE_ITEMS.filter((item) => canSeeContacts || item.value !== NEEDS_CONTACTS)}
        value={moreType ?? null}
        anchor={moreButton}
        popupWidth="wide"
        isOpen={isChoosingMore}
        onOpenChange={setIsChoosingMore}
        onSelect={(next) => {
          const chosen = MORE_TYPES.find((entryType) => entryType === next)
          if (chosen) {
            onChange(chosen)
          }
        }}
      />
    </>
  )
}

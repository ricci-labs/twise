import { CategoryArt } from '@web/components/display/category-art'
import { PickerField } from '@web/components/inputs/picker-field'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { CommissionFromFieldProps } from '@web/features/planning/planning.types'
import { useId, useRef, useState } from 'react'

const messages = planningMessages.commission
const WALLET_ICON = 'wallet'

export function CommissionFromField({ accounts, value, onChange }: CommissionFromFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const id = useId()
  const chosen = accounts.find((account) => account.id === value)
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label">
        {messages.from}
      </label>
      <PickerField
        id={id}
        ref={anchor}
        value={chosen?.name ?? null}
        art={chosen && <CategoryArt name={chosen.name} icon={chosen.icon ?? WALLET_ICON} />}
        placeholder={messages.fromPlaceholder}
        onClick={() => setIsOpen(true)}
      />
      <PickerSheet
        title={messages.from}
        subtitle={messages.fromSubtitle}
        items={accounts.map((account) => ({
          value: account.id,
          label: account.name,
          icon: account.icon ?? WALLET_ICON,
        }))}
        value={value || null}
        anchor={anchor}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={onChange}
      />
    </div>
  )
}

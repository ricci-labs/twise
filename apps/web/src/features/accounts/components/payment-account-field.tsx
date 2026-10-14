import { isMoneyAccountKind } from '@financas/shared'
import { CategoryArt } from '@web/components/display/category-art'
import { FormField } from '@web/components/forms/form-field'
import { PickerField } from '@web/components/inputs/picker-field'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  CardFormInput,
  LedgerAccount,
  PaymentAccountFieldProps,
} from '@web/features/accounts/accounts.types'
import { useRef, useState } from 'react'

const messages = accountsMessages.cardForm

export function PaymentAccountField({ accounts }: PaymentAccountFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const items = accounts.filter(isPayingAccount).map((account) => ({
    value: account.id,
    label: account.name,
    icon: account.icon,
    detail: accountsMessages.kinds[account.kind as keyof typeof accountsMessages.kinds],
  }))
  return (
    <FormField<CardFormInput> name="paymentAccountId" label={messages.paymentAccount}>
      {(control) => {
        const chosen = accounts.find((account) => account.id === control.value)
        return (
          <>
            <PickerField
              id={control.id}
              ref={(element) => {
                anchor.current = element
                control.ref(element)
              }}
              aria-invalid={control['aria-invalid']}
              aria-describedby={control['aria-describedby']}
              value={chosen?.name ?? null}
              detail={chosen?.archivedAt ? messages.paymentArchived : messages.paymentDetail}
              art={chosen && <CategoryArt name={chosen.name} icon={chosen.icon} />}
              placeholder={messages.paymentPlaceholder}
              onClick={() => setIsOpen(true)}
            />
            <PickerSheet
              title={messages.paymentAccount}
              items={items}
              value={control.value || null}
              anchor={anchor}
              isOpen={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open)
                if (!open) {
                  control.onBlur()
                }
              }}
              onSelect={(value) => control.onChange({ target: { value } })}
            />
          </>
        )
      }}
    </FormField>
  )
}

function isPayingAccount(account: LedgerAccount): boolean {
  return !account.isSystem && account.archivedAt === null && isMoneyAccountKind(account.kind)
}

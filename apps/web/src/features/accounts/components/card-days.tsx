import { invoiceForPurchase, todayIn } from '@financas/shared'
import { Alert } from '@web/components/feedback/alert'
import { CyclePreview } from '@web/components/finance/cycle-preview'
import { FormField } from '@web/components/forms/form-field'
import { DayField } from '@web/components/inputs/day-field'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { CardDaysProps, CardFormInput } from '@web/features/accounts/accounts.types'
import { formatShortDate } from '@web/lib/format/calendar'
import { useFormState, useWatch } from 'react-hook-form'

const messages = accountsMessages.cardForm

const TIME_ZONE = 'America/Sao_Paulo'

export function CardDays({ isEditing }: CardDaysProps) {
  const [closingDay, dueDay, purchaseOnClosingDayGoesNext] = useWatch<
    CardFormInput,
    ['closingDay', 'dueDay', 'purchaseOnClosingDayGoesNext']
  >({ name: ['closingDay', 'dueDay', 'purchaseOnClosingDayGoesNext'] })
  const { dirtyFields } = useFormState<CardFormInput>()
  const haveDaysChanged = isEditing && Boolean(dirtyFields.closingDay || dirtyFields.dueDay)
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-2 items-start gap-2.5">
          <FormField<CardFormInput> name="closingDay" label={messages.closingDay} isRequired>
            {(control) => (
              <DayField
                id={control.id}
                ref={control.ref}
                value={control.value}
                onChange={control.onChange}
                onBlur={control.onBlur}
                aria-invalid={control['aria-invalid']}
                aria-describedby={control['aria-describedby']}
                title={messages.closingDay}
                summary={messages.closingSummary}
              />
            )}
          </FormField>
          <FormField<CardFormInput> name="dueDay" label={messages.dueDay} isRequired>
            {(control) => (
              <DayField
                id={control.id}
                ref={control.ref}
                value={control.value}
                onChange={control.onChange}
                onBlur={control.onBlur}
                aria-invalid={control['aria-invalid']}
                aria-describedby={control['aria-describedby']}
                title={messages.dueDay}
                summary={messages.dueSummary}
              />
            )}
          </FormField>
        </div>
        <p className="text-body-sm text-ink-muted">{messages.daysHelp}</p>
      </div>
      {closingDay && dueDay && (
        <div className="-mt-1.5">
          <CyclePreview
            text={messages.preview(
              closingDay,
              dueDay,
              formatShortDate(
                invoiceForPurchase(todayIn(TIME_ZONE, new Date()), {
                  closingDay: Number(closingDay),
                  dueDay: Number(dueDay),
                  purchaseOnClosingDayGoesNext,
                }).dueOn,
              ),
            )}
          />
        </div>
      )}
      {haveDaysChanged && (
        <Alert tone="warning" icon="warn">
          {messages.daysChanged}
        </Alert>
      )}
    </>
  )
}

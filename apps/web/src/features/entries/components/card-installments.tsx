import { formatBrl, type IsoDate, MAX_INSTALLMENTS, parseIsoDate } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { Alert } from '@web/components/feedback/alert'
import { InvoicePreview } from '@web/components/finance/invoice-preview'
import { FieldGroup } from '@web/components/forms/field-group'
import { Stepper } from '@web/components/inputs/stepper'
import { Switch } from '@web/components/inputs/switch'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  CardInstallmentsProps,
  CardPlan,
  CardPreviewProps,
  EntryFormInput,
} from '@web/features/entries/entries.types'
import { formatMonthName, formatShortDate, formatShortDateWithYear } from '@web/lib/format/calendar'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

const messages = entriesMessages.cards
const fields = entriesMessages.fields

const SHOWN_ROWS = 3

export function CardInstallments({ plan, today }: CardInstallmentsProps) {
  const { control, setValue } = useFormContext<EntryFormInput>()
  const [count, isInProgress] = useWatch<EntryFormInput, ['installmentCount', 'isInProgress']>({
    name: ['installmentCount', 'isInProgress'],
  })
  const startFrom = (installment: number) => {
    setValue('isInProgress', true, { shouldDirty: true })
    setValue('firstInstallment', installment, { shouldDirty: true, shouldValidate: true })
  }
  return (
    <>
      <Controller
        control={control}
        name="installmentCount"
        render={({ field, fieldState }) => (
          <FieldGroup label={fields.installments} isRequired error={fieldState.error?.message}>
            <Stepper
              value={field.value}
              min={1}
              max={MAX_INSTALLMENTS}
              onChange={field.onChange}
              valueText={field.value === 1 ? messages.cash : messages.times(field.value)}
              decreaseLabel={messages.fewer}
              increaseLabel={messages.more}
              aside={
                plan && field.value > 1
                  ? messages.each(field.value, formatBrl(plan.eachCents))
                  : undefined
              }
            />
          </FieldGroup>
        )}
      />
      {plan && <Preview plan={plan} today={today} />}
      {plan?.closedAt && plan.firstOpen && (
        <Alert
          className="lg:col-span-2"
          tone="warning"
          icon="warn"
          action={
            <Button variant="subtle" size="sm" onClick={() => startFrom(plan.firstOpen ?? 1)}>
              {messages.startFrom(plan.firstOpen)}
            </Button>
          }
        >
          {messages.closed(formatMonthName(plan.closedAt.invoice.referenceMonth), plan.firstOpen)}
        </Alert>
      )}
      <div
        className={
          isInProgress
            ? 'flex flex-col gap-2.5 rounded-lg border border-border bg-surface px-3.5 pt-1 pb-3.5 lg:col-span-2'
            : 'flex flex-col lg:col-span-2'
        }
      >
        <Controller
          control={control}
          name="isInProgress"
          render={({ field }) => (
            <Switch
              label={fields.inProgress}
              isChecked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        {isInProgress && (
          <Controller
            control={control}
            name="firstInstallment"
            render={({ field, fieldState }) => (
              <FieldGroup
                label={fields.startFrom}
                help={messages.startHelp}
                error={fieldState.error?.message}
              >
                <Stepper
                  value={field.value}
                  min={1}
                  max={count}
                  onChange={field.onChange}
                  valueText={String(field.value)}
                  decreaseLabel={messages.earlier}
                  increaseLabel={messages.later}
                  aside={messages.ofCount(count)}
                />
              </FieldGroup>
            )}
          />
        )}
      </div>
    </>
  )
}

function Preview({ plan, today }: CardPreviewProps) {
  const first = plan.installments[0]
  if (!first) {
    return null
  }
  const due = dueText(first.invoice.dueOn, today)
  const shown = plan.installments.slice(0, SHOWN_ROWS)
  const rest = plan.installments.slice(SHOWN_ROWS)
  const last = plan.installments.at(-1)
  return (
    <InvoicePreview
      className="-mt-1.5 lg:col-span-2 lg:mt-0"
      title={titleOf(plan, due)}
      rows={shown.map((installment) => ({
        key: String(installment.installmentNo),
        number: messages.number(installment.installmentNo, installment.count),
        due: messages.due(dueText(installment.invoice.dueOn, today)),
        amountCents: installment.amountCents,
        isClosed: installment.isInvoiceClosed,
      }))}
      more={
        rest.length > 0 && last
          ? messages.rest(rest.length, formatShortDateWithYear(last.invoice.dueOn))
          : undefined
      }
    />
  )
}

function titleOf(plan: CardPlan, due: string): string {
  if (plan.closedAt) {
    return messages.wouldFall(due)
  }
  if (plan.isInProgress) {
    return messages.remaining(plan.installments.length, due)
  }
  return plan.count === 1 ? messages.single(due) : messages.first(due)
}

function dueText(date: IsoDate, today: IsoDate): string {
  return parseIsoDate(date).year === parseIsoDate(today).year
    ? formatShortDate(date)
    : formatShortDateWithYear(date)
}

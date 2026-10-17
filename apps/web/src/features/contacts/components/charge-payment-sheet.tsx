import { formatBrl } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { CategoryArt } from '@web/components/display/category-art'
import { Alert } from '@web/components/feedback/alert'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { DateInput } from '@web/components/inputs/date-input'
import { MoneyInput } from '@web/components/inputs/money-input'
import { PickerField } from '@web/components/inputs/picker-field'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import { Sheet } from '@web/components/layout/sheet'
import { moneyAccountsQueryOptions } from '@web/features/contacts/api/contacts.queries'
import { usePayCharge } from '@web/features/contacts/api/use-charge-actions'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import { paymentFormSchema } from '@web/features/contacts/contacts.schemas'
import type {
  ChargePaymentFormProps,
  ChargePaymentSheetProps,
  PaymentAccountFieldProps,
  PaymentFormInput,
} from '@web/features/contacts/contacts.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatShortDate } from '@web/lib/format/calendar'
import { centsOfTypedAmount, formatTypedAmount } from '@web/lib/format/money'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useEffect, useRef, useState } from 'react'
import { useWatch } from 'react-hook-form'

const messages = contactsMessages.payment
const WALLET_ICON = 'wallet'

export function ChargePaymentSheet(props: ChargePaymentSheetProps) {
  return (
    <Sheet
      title={messages.title}
      closeLabel={messages.close}
      isOpen={props.charge !== null}
      onOpenChange={props.onOpenChange}
    >
      {props.charge && <ChargePaymentForm {...props} charge={props.charge} />}
    </Sheet>
  )
}

function ChargePaymentForm({
  workspaceId,
  contactName,
  charge,
  today,
  onOpenChange,
}: ChargePaymentFormProps) {
  const accounts = useQuery(moneyAccountsQueryOptions(workspaceId)).data ?? []
  const pay = usePayCharge(workspaceId)
  const navigate = useNavigate()
  const [problem, setProblem] = useState<string | null>(null)
  const leftCents = Math.max(charge.amountCents - charge.paidCents, 0)
  const form = useSchemaForm({
    schema: paymentFormSchema,
    requiredMessages: { accountId: messages.accountRequired },
    defaultValues: {
      amount: leftCents > 0 ? formatTypedAmount(leftCents) : '',
      accountId: '',
      occurredOn: today,
    },
  })
  const amount = useWatch({ control: form.control, name: 'amount' })
  const onlyAccount = accounts.length === 1 ? accounts[0]?.id : undefined
  useEffect(() => {
    if (onlyAccount && !form.getValues('accountId')) {
      form.setValue('accountId', onlyAccount, { shouldValidate: true })
    }
  }, [onlyAccount, form])
  const isOver = (centsOfTypedAmount(amount) ?? 0) > leftCents

  async function save(values: { amount: string; accountId: string; occurredOn: string }) {
    setProblem(null)
    try {
      const { entryId } = await pay.mutateAsync({
        chargeId: charge.id,
        payment: {
          amountCents: centsOfTypedAmount(values.amount) ?? 0,
          receivedInAccountId: values.accountId,
          occurredOn: values.occurredOn,
        },
      })
      onOpenChange(false)
      showToast(messages.done, {
        tone: 'success',
        action: {
          label: messages.seeEntry,
          onPress: () =>
            void navigate({
              to: '/w/$workspaceId/entries/$entry',
              params: { workspaceId, entry: entryId },
            }),
        },
      })
    } catch (error) {
      setProblem(errorMessageFor(error))
    }
  }

  return (
    <Form form={form} onSubmit={save} className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-0.5 rounded-md bg-sunken p-3">
        <span className="font-semibold text-body">
          {messages.chargeTitle(formatShortDate(charge.createdOn), contactName)}
        </span>
        <span className="text-body-sm text-ink-muted">
          {charge.paidCents > 0
            ? messages.someReceived(
                formatBrl(charge.amountCents),
                formatBrl(charge.paidCents),
                formatBrl(leftCents),
              )
            : messages.nothingYet(formatBrl(charge.amountCents), formatBrl(leftCents))}
        </span>
      </div>
      <FormField<PaymentFormInput> name="amount" label={messages.amount} isRequired>
        {(control) => <MoneyInput inputMode="decimal" {...control} />}
      </FormField>
      {isOver && <Alert tone="warning">{messages.overLeft}</Alert>}
      <FormField<PaymentFormInput> name="accountId" label={messages.account} isRequired>
        {(control) => <PaymentAccountField accounts={accounts} {...control} />}
      </FormField>
      <FormField<PaymentFormInput> name="occurredOn" label={messages.date} isRequired>
        {(control) => <DateInput title={messages.date} today={today} {...control} />}
      </FormField>
      {problem && (
        <Alert tone="danger" isUrgent>
          {problem}
        </Alert>
      )}
      <div className="-mx-4 flex items-center justify-between gap-3 border-t border-border px-4 pt-4">
        <Button variant="tertiary" onClick={() => onOpenChange(false)}>
          {messages.close}
        </Button>
        <SubmitButton className="max-w-62 flex-1">{messages.submit}</SubmitButton>
      </div>
    </Form>
  )
}

function PaymentAccountField({ accounts, value, onChange, id, onBlur }: PaymentAccountFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const chosen = accounts.find((account) => account.id === value)
  return (
    <>
      <PickerField
        id={id}
        ref={anchor}
        value={chosen?.name ?? null}
        art={chosen && <CategoryArt name={chosen.name} icon={chosen.icon ?? WALLET_ICON} />}
        placeholder={messages.accountPlaceholder}
        onClick={() => setIsOpen(true)}
        onBlur={onBlur}
      />
      <PickerSheet
        title={messages.account}
        items={accounts.map((account) => ({
          value: account.id,
          label: account.name,
          icon: account.icon ?? WALLET_ICON,
        }))}
        value={value || null}
        anchor={anchor}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={(accountId) => onChange({ target: { value: accountId } })}
      />
    </>
  )
}

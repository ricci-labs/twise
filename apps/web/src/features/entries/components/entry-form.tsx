import { type EntryInput, entryInputSchema, PAYMENT_METHODS } from '@financas/shared'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { showToast } from '@web/components/feedback/toast'
import { FormField } from '@web/components/forms/form-field'
import { MoneyInput } from '@web/components/inputs/money-input'
import { Select } from '@web/components/inputs/select'
import { TextArea } from '@web/components/inputs/text-area'
import { TextInput } from '@web/components/inputs/text-input'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { useRecordEntry } from '@web/features/entries/api/use-record-entry'
import { AccountField } from '@web/features/entries/components/account-field'
import { CategoryField } from '@web/features/entries/components/category-field'
import { DateField } from '@web/features/entries/components/date-field'
import { FormFooter } from '@web/features/entries/components/form-footer'
import { MembersField } from '@web/features/entries/components/members-field'
import { entriesMessages } from '@web/features/entries/entries.messages'
import { expenseFormSchema } from '@web/features/entries/entries.schemas'
import type {
  AfterSave,
  EntryFormProps,
  ExpenseFormInput,
  ExpenseFormValues,
} from '@web/features/entries/entries.types'
import { useIsOnline } from '@web/hooks/use-is-online'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { fill } from '@web/lib/format/template'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { type BaseSyntheticEvent, useRef, useState } from 'react'
import { FormProvider, useFormState } from 'react-hook-form'

const messages = entriesMessages.newEntry
const fields = entriesMessages.fields
const FIELD_OF_CODE: Readonly<Record<string, keyof ExpenseFormInput>> = {
  ACCOUNT_NOT_AVAILABLE: 'paidFromAccountId',
  NOT_A_MONEY_ACCOUNT: 'paidFromAccountId',
  NOT_AN_EXPENSE_CATEGORY: 'categoryId',
  SPENT_BY_NOT_A_MEMBER: 'spentByUserId',
}
const PAYMENT_OPTIONS = PAYMENT_METHODS.map((method) => ({
  value: method,
  label: entriesMessages.paymentMethods[method],
}))

export function EntryForm({
  workspaceId,
  currentUserId,
  canSeeMembers,
  today,
  onClose,
}: EntryFormProps) {
  const isOnline = useIsOnline()
  const recordEntry = useRecordEntry(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const amountInput = useRef<HTMLInputElement>(null)
  const blank = blankExpense(today, canSeeMembers ? currentUserId : '')
  const form = useSchemaForm({
    schema: expenseFormSchema,
    requiredMessages: entriesMessages.required,
    defaultValues: blank,
  })
  const { isDirty } = useFormState({ control: form.control })

  function requestClose() {
    if (isDirty) {
      setIsDiscarding(true)
      return
    }
    onClose()
  }

  async function save(values: ExpenseFormValues, event?: BaseSyntheticEvent) {
    setProblem(null)
    try {
      await recordEntry.mutateAsync(toEntryInput(values))
      showToast(messages.saved, { tone: 'success' })
      if (afterSaveOf(event) === 'another') {
        form.reset(
          { ...blank, occurredOn: values.occurredOn, paidFromAccountId: values.paidFromAccountId },
          { keepFieldsRef: true },
        )
        form.setFocus('amount')
        return
      }
      onClose()
    } catch (error) {
      showProblem(error)
    }
  }

  function showProblem(error: unknown) {
    const field = error instanceof ApiError ? FIELD_OF_CODE[error.code] : undefined
    if (field) {
      form.setError(
        field,
        { message: errorMessageFor(error, { Conta: fields.paidFrom }) },
        { shouldFocus: true },
      )
      return
    }
    const ref = error instanceof ApiError ? error.ref : null
    setProblem(ref ? fill(messages.failed, { ref }) : errorMessageFor(error))
  }

  return (
    <FormProvider {...form}>
      <FormOverlay
        title={messages.title}
        closeLabel={messages.close}
        isOpen
        onRequestClose={requestClose}
        onSubmit={form.handleSubmit(save)}
        initialFocus={amountInput}
        banner={<OfflineBanner message={messages.offline} />}
        footer={<FormFooter isOnline={isOnline} problem={problem} onCancel={requestClose} />}
      >
        <p className="mx-4 mt-3.5 text-note text-ink-muted lg:mx-8">
          <span aria-hidden="true" className="font-semibold text-danger">
            {messages.requiredMark}
          </span>{' '}
          {messages.requiredLegend}
        </p>
        <div className="grid gap-4.5 px-4 pt-2.5 lg:grid-cols-2 lg:gap-x-6 lg:px-8">
          <div>
            <FormField<ExpenseFormInput> name="amount" label={fields.amount} isRequired>
              {(control) => (
                <MoneyInput
                  size="lg"
                  {...control}
                  ref={(element) => {
                    amountInput.current = element
                    control.ref(element)
                  }}
                />
              )}
            </FormField>
          </div>
          <FormField<ExpenseFormInput> name="description" label={fields.description} isRequired>
            {(control) => (
              <TextInput
                autoComplete="off"
                placeholder={fields.descriptionPlaceholder}
                {...control}
              />
            )}
          </FormField>
          <AccountField workspaceId={workspaceId} />
          <CategoryField workspaceId={workspaceId} />
          <DateField today={today} />
          <FormField<ExpenseFormInput> name="paymentMethod" label={fields.paymentMethod}>
            {(control) => (
              <Select
                options={PAYMENT_OPTIONS}
                placeholder={fields.paymentMethodPlaceholder}
                {...control}
              />
            )}
          </FormField>
          {canSeeMembers && <MembersField workspaceId={workspaceId} />}
          <div className="lg:col-span-2">
            <FormField<ExpenseFormInput> name="notes" label={fields.notes} maxLength={2000}>
              {(control) => <TextArea {...control} />}
            </FormField>
          </div>
        </div>
      </FormOverlay>
      <ConfirmDialog
        title={messages.discard.title}
        description={messages.discard.text}
        cancelLabel={messages.discard.keep}
        confirmLabel={messages.discard.confirm}
        isOpen={isDiscarding}
        onOpenChange={setIsDiscarding}
        onConfirm={onClose}
      />
    </FormProvider>
  )
}

function afterSaveOf(event: BaseSyntheticEvent | undefined): AfterSave {
  const submitter = (event?.nativeEvent as SubmitEvent | undefined)?.submitter
  return submitter?.dataset.afterSave === 'another' ? 'another' : 'close'
}

function blankExpense(today: string, spentByUserId: string): ExpenseFormInput {
  return {
    amount: '',
    description: '',
    paidFromAccountId: '',
    categoryId: '',
    occurredOn: today,
    paymentMethod: '',
    spentByUserId,
    notes: '',
  }
}

function toEntryInput(values: ExpenseFormValues): EntryInput {
  return entryInputSchema.parse({
    entryType: 'expense',
    amountCents: centsOfTypedAmount(values.amount),
    description: values.description,
    occurredOn: values.occurredOn,
    paidFromAccountId: values.paidFromAccountId,
    categoryId: values.categoryId,
    paymentMethod: values.paymentMethod || null,
    spentByUserId: values.spentByUserId || null,
    notes: values.notes || null,
  })
}

import { type EntryInput, entryInputSchema, PAYMENT_METHODS } from '@financas/shared'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { showToast } from '@web/components/feedback/toast'
import { FormField } from '@web/components/forms/form-field'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { MoneyInput } from '@web/components/inputs/money-input'
import { Select } from '@web/components/inputs/select'
import { TextArea } from '@web/components/inputs/text-area'
import { TextInput } from '@web/components/inputs/text-input'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { useRecordEntry } from '@web/features/entries/api/use-record-entry'
import { DateField } from '@web/features/entries/components/date-field'
import {
  hasCategory,
  hasPaymentMethod,
  isSpending,
} from '@web/features/entries/components/entry-kind'
import { FormFooter } from '@web/features/entries/components/form-footer'
import { MembersField } from '@web/features/entries/components/members-field'
import { MoneyFields } from '@web/features/entries/components/money-fields'
import { SharesField } from '@web/features/entries/components/shares-field'
import { entriesMessages } from '@web/features/entries/entries.messages'
import { entryFormSchema } from '@web/features/entries/entries.schemas'
import type {
  AfterSave,
  EntryFormInput,
  EntryFormProps,
  EntryFormValues,
  FormEntryType,
} from '@web/features/entries/entries.types'
import { useCardPlan } from '@web/features/entries/hooks/use-card-plan'
import { useShareTotals } from '@web/features/entries/hooks/use-share-totals'
import { useIsOnline } from '@web/hooks/use-is-online'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatMonthName } from '@web/lib/format/calendar'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { fill } from '@web/lib/format/template'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { type BaseSyntheticEvent, useRef, useState } from 'react'
import { FormProvider, useFormState, useWatch } from 'react-hook-form'

const messages = entriesMessages.newEntry
const fields = entriesMessages.fields
const FIELD_OF_CODE: Readonly<Record<string, keyof EntryFormInput>> = {
  NOT_A_MONEY_ACCOUNT: 'accountId',
  SAME_ACCOUNT: 'toAccountId',
  NOT_AN_INCOME_CATEGORY: 'categoryId',
  NOT_A_CARD: 'cardAccountId',
  CARD_NOT_SET_UP: 'cardAccountId',
  NOT_AN_EXPENSE_CATEGORY: 'categoryId',
  SPENT_BY_NOT_A_MEMBER: 'spentByUserId',
  CONTACT_NOT_AVAILABLE: 'shares',
  CONTACT_TWICE: 'shares',
  SHARES_EXCEED_AMOUNT: 'shares',
  SHARE_NOT_POSITIVE: 'shares',
}
const ACCOUNT_NOT_AVAILABLE = 'ACCOUNT_NOT_AVAILABLE'
const INVOICE_CLOSED = 'INVOICE_CLOSED'
const CARD_PURCHASE = 'card_purchase'
const CREDIT = 'credit'
const TYPE_OPTIONS = (['expense', CARD_PURCHASE, 'income', 'transfer'] as const).map(
  (entryType) => ({
    value: entryType,
    label: messages.types[entryType],
  }),
)
const PAYMENT_OPTIONS = PAYMENT_METHODS.map((method) => ({
  value: method,
  label: entriesMessages.paymentMethods[method],
}))

export function EntryForm({
  workspaceId,
  currentUserId,
  currentUserName,
  canSeeMembers,
  canSeeContacts,
  canCreateAccounts,
  canCreateCards,
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
    schema: entryFormSchema,
    requiredMessages: entriesMessages.required,
    defaultValues: blank,
  })
  const { isDirty } = useFormState({ control: form.control })
  const entryType = useWatch({ control: form.control, name: 'entryType' })
  const plan = useCardPlan(form.control, workspaceId, today)
  const isCardPurchase = entryType === CARD_PURCHASE
  const isSpendingEntry = isSpending(entryType)
  const shareTotals = useShareTotals(form.control)

  function requestClose() {
    if (isDirty) {
      setIsDiscarding(true)
      return
    }
    onClose()
  }

  async function save(values: EntryFormValues, event?: BaseSyntheticEvent) {
    setProblem(null)
    try {
      await recordEntry.mutateAsync(toEntryInput(values))
      showToast(messages.saved, { tone: 'success' })
      if (afterSaveOf(event) === 'another') {
        form.reset(
          {
            ...blank,
            entryType: values.entryType,
            occurredOn: values.occurredOn,
            accountId: values.accountId,
            toAccountId: values.toAccountId,
            cardAccountId: values.cardAccountId,
            paymentMethod: values.entryType === CARD_PURCHASE ? CREDIT : '',
          },
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

  function changeType(next: FormEntryType) {
    const paymentMethod = form.getValues('paymentMethod')
    if (categoryKindOf(next) !== categoryKindOf(entryType)) {
      form.setValue('categoryId', '')
    }
    form.setValue('entryType', next, { shouldDirty: true })
    if (next === CARD_PURCHASE && paymentMethod === '') {
      form.setValue('paymentMethod', CREDIT)
    }
    if (next !== CARD_PURCHASE && paymentMethod === CREDIT) {
      form.setValue('paymentMethod', '')
    }
  }

  function fieldOf(error: unknown): keyof EntryFormInput | undefined {
    if (!(error instanceof ApiError)) {
      return undefined
    }
    if (error.code === ACCOUNT_NOT_AVAILABLE) {
      return isCardPurchase ? 'cardAccountId' : 'accountId'
    }
    return FIELD_OF_CODE[error.code]
  }

  function showProblem(error: unknown) {
    if (
      error instanceof ApiError &&
      error.code === INVOICE_CLOSED &&
      plan?.closedAt &&
      plan.firstOpen
    ) {
      setProblem(
        entriesMessages.cards.closed(
          formatMonthName(plan.closedAt.invoice.referenceMonth),
          plan.firstOpen,
        ),
      )
      return
    }
    const field = fieldOf(error)
    if (field) {
      form.setError(
        field,
        { type: 'server', message: errorMessageFor(error, { Conta: fields.paidFrom }) },
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
        footer={
          <FormFooter
            isOnline={isOnline}
            isBlocked={Boolean(plan?.closedAt) || (isSpendingEntry && shareTotals.isOver)}
            problem={problem}
            onCancel={requestClose}
          />
        }
      >
        <ChoiceChips
          label={messages.typesLabel}
          className="px-4 pt-3.5 lg:px-8 lg:pt-2.5"
          options={TYPE_OPTIONS}
          value={entryType}
          onSelect={(next) => changeType(next as FormEntryType)}
        />
        <p className="mx-4 mt-3.5 text-note text-ink-muted lg:mx-8">
          <span aria-hidden="true" className="font-semibold text-danger">
            {messages.requiredMark}
          </span>{' '}
          {messages.requiredLegend}
        </p>
        <div className="grid gap-4.5 px-4 pt-2.5 lg:grid-cols-2 lg:gap-x-6 lg:px-8">
          <div>
            <FormField<EntryFormInput> name="amount" label={fields.amount} isRequired>
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
          <FormField<EntryFormInput> name="description" label={fields.description} isRequired>
            {(control) => (
              <TextInput
                autoComplete="off"
                placeholder={fields.descriptionPlaceholder}
                {...control}
              />
            )}
          </FormField>
          <MoneyFields
            entryType={entryType}
            workspaceId={workspaceId}
            canCreateAccounts={canCreateAccounts}
            canCreateCards={canCreateCards}
            plan={plan}
            today={today}
          />
          <DateField today={today} />
          {hasPaymentMethod(entryType) && (
            <FormField<EntryFormInput> name="paymentMethod" label={fields.paymentMethod}>
              {(control) => (
                <Select
                  options={PAYMENT_OPTIONS}
                  placeholder={fields.paymentMethodPlaceholder}
                  {...control}
                />
              )}
            </FormField>
          )}
          {isSpendingEntry && canSeeMembers && <MembersField workspaceId={workspaceId} />}
          {isSpendingEntry && canSeeContacts && (
            <div className="lg:col-span-2">
              <SharesField
                workspaceId={workspaceId}
                yoursName={currentUserName}
                totals={shareTotals}
              />
            </div>
          )}
          <div className="lg:col-span-2">
            <FormField<EntryFormInput> name="notes" label={fields.notes} maxLength={2000}>
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

function blankExpense(today: string, spentByUserId: string): EntryFormInput {
  return {
    entryType: 'expense',
    amount: '',
    description: '',
    accountId: '',
    toAccountId: '',
    cardAccountId: '',
    installmentCount: 1,
    isInProgress: false,
    firstInstallment: 1,
    categoryId: '',
    occurredOn: today,
    paymentMethod: '',
    spentByUserId,
    shares: [],
    notes: '',
  }
}

function categoryKindOf(entryType: FormEntryType): string | undefined {
  if (!hasCategory(entryType)) {
    return undefined
  }
  return entryType === 'income' ? 'income' : 'expense'
}

function toEntryInput(values: EntryFormValues): EntryInput {
  const details = {
    amountCents: centsOfTypedAmount(values.amount),
    description: values.description,
    occurredOn: values.occurredOn,
    notes: values.notes || null,
  }
  const spending = {
    ...details,
    categoryId: values.categoryId,
    paymentMethod: values.paymentMethod || null,
    spentByUserId: values.spentByUserId || null,
    shares: values.shares.map((share) => ({
      contactId: share.contactId,
      amountCents: centsOfTypedAmount(share.amount),
    })),
  }
  if (values.entryType === CARD_PURCHASE) {
    return entryInputSchema.parse({
      ...spending,
      entryType: CARD_PURCHASE,
      cardAccountId: values.cardAccountId,
      installmentCount: values.installmentCount,
      firstInstallment: values.isInProgress ? values.firstInstallment : 1,
    })
  }
  if (values.entryType === 'income') {
    return entryInputSchema.parse({
      ...details,
      entryType: 'income',
      receivedInAccountId: values.accountId,
      categoryId: values.categoryId,
      paymentMethod: values.paymentMethod || null,
    })
  }
  if (values.entryType === 'transfer') {
    return entryInputSchema.parse({
      ...details,
      entryType: 'transfer',
      fromAccountId: values.accountId,
      toAccountId: values.toAccountId,
    })
  }
  return entryInputSchema.parse({
    ...spending,
    entryType: 'expense',
    paidFromAccountId: values.accountId,
  })
}

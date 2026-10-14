import { PAYMENT_METHODS } from '@financas/shared'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { showToast } from '@web/components/feedback/toast'
import { FormField } from '@web/components/forms/form-field'
import { Select } from '@web/components/inputs/select'
import { TextArea } from '@web/components/inputs/text-area'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { useRecordEntry } from '@web/features/entries/api/use-record-entry'
import { AmountField } from '@web/features/entries/components/amount-field'
import { DateField } from '@web/features/entries/components/date-field'
import { DescriptionField } from '@web/features/entries/components/description-field'
import { toEntryInput } from '@web/features/entries/components/entry-input'
import {
  hasCategory,
  hasPaymentMethod,
  isSpending,
} from '@web/features/entries/components/entry-kind'
import { FormFooter } from '@web/features/entries/components/form-footer'
import { MembersField } from '@web/features/entries/components/members-field'
import { LeadFields, MoneyFields } from '@web/features/entries/components/money-fields'
import { RecentRow } from '@web/features/entries/components/recent-row'
import { SharesField } from '@web/features/entries/components/shares-field'
import { TypePills } from '@web/features/entries/components/type-pills'
import { entriesMessages } from '@web/features/entries/entries.messages'
import { entryFormSchema } from '@web/features/entries/entries.schemas'
import type {
  AfterSave,
  CardPlan,
  EntryFormInput,
  EntryFormProps,
  EntryFormValues,
  EntryPrefill,
  FormEntryType,
} from '@web/features/entries/entries.types'
import { useAmountWarning } from '@web/features/entries/hooks/use-amount-warning'
import { useAutoFill } from '@web/features/entries/hooks/use-auto-fill'
import { useCardPlan } from '@web/features/entries/hooks/use-card-plan'
import { useShareTotals } from '@web/features/entries/hooks/use-share-totals'
import { useIsOnline } from '@web/hooks/use-is-online'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatMonthName } from '@web/lib/format/calendar'
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
  INVOICE_NOT_FOUND: 'invoiceId',
  PAYMENT_ACCOUNT_REQUIRED: 'accountId',
  PAYMENT_ACCOUNT_NOT_AVAILABLE: 'accountId',
  BALANCE_IS_ZERO: 'amount',
  AMOUNT_NOT_POSITIVE: 'amount',
}
const ACCOUNT_NOT_AVAILABLE = 'ACCOUNT_NOT_AVAILABLE'
const CONTACT_NOT_AVAILABLE = 'CONTACT_NOT_AVAILABLE'
const INVOICE_CLOSED = 'INVOICE_CLOSED'
const CARD_PURCHASE = 'card_purchase'
const OPENING_BALANCE = 'opening_balance'
const SETTLEMENT = 'settlement'
const CREDIT = 'credit'
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
  prefill = {},
  onClose,
}: EntryFormProps) {
  const isOnline = useIsOnline()
  const recordEntry = useRecordEntry(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const amountInput = useRef<HTMLInputElement>(null)
  const blank = prefilled(blankExpense(today, canSeeMembers ? currentUserId : ''), prefill)
  const isNewForm = prefill.entryType === undefined
  const form = useSchemaForm({
    schema: entryFormSchema,
    requiredMessages: entriesMessages.required,
    defaultValues: blank,
  })
  const autoFill = useAutoFill(form, amountInput)
  const { isDirty } = useFormState({ control: form.control })
  const entryType = useWatch({ control: form.control, name: 'entryType' })
  const plan = useCardPlan(form.control, workspaceId, today)
  const isCardPurchase = entryType === CARD_PURCHASE
  const isOpeningBalance = entryType === OPENING_BALANCE
  const isDescriptionLast = entryType === 'invoice_payment' || entryType === SETTLEMENT
  const amountWarning = useAmountWarning(form.control, workspaceId)
  const isSpendingEntry = isSpending(entryType)
  const shareTotals = useShareTotals(form.control)

  const descriptionField = (
    <DescriptionField workspaceId={workspaceId} entryType={entryType} autoFill={autoFill} />
  )

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
            description: values.entryType === OPENING_BALANCE ? messages.openingDescription : '',
            occurredOn: values.occurredOn,
            accountId: values.accountId,
            toAccountId: values.toAccountId,
            cardAccountId: values.cardAccountId,
            paymentMethod: values.entryType === CARD_PURCHASE ? CREDIT : '',
          },
          { keepFieldsRef: true },
        )
        autoFill.forget()
        form.setFocus('amount')
        return
      }
      onClose()
    } catch (error) {
      showProblem(error)
    }
  }

  function changeType(next: FormEntryType) {
    autoFill.forget()
    if (categoryKindOf(next) !== categoryKindOf(entryType)) {
      form.setValue('categoryId', '')
    }
    form.setValue('entryType', next, { shouldDirty: true })
    form.setValue('paymentMethod', paymentMethodFor(next, form.getValues('paymentMethod')))
    if (next === OPENING_BALANCE && form.getValues('description').trim() === '') {
      form.setValue('description', messages.openingDescription)
    }
  }

  function fieldOf(error: unknown): keyof EntryFormInput | undefined {
    if (!(error instanceof ApiError)) {
      return undefined
    }
    if (error.code === ACCOUNT_NOT_AVAILABLE) {
      return isCardPurchase ? 'cardAccountId' : 'accountId'
    }
    if (error.code === CONTACT_NOT_AVAILABLE && entryType === SETTLEMENT) {
      return 'contactId'
    }
    return FIELD_OF_CODE[error.code]
  }

  function showProblem(error: unknown) {
    const closed = closedInvoiceProblem(error, plan)
    if (closed) {
      setProblem(closed)
      return
    }
    const field = fieldOf(error)
    if (field) {
      form.setError(
        field,
        { type: 'server', message: fieldMessageOf(field, error) },
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
        <TypePills value={entryType} canSeeContacts={canSeeContacts} onChange={changeType} />
        {isNewForm && (
          <div className="mt-3.5 lg:px-8">
            <RecentRow workspaceId={workspaceId} entryType={entryType} autoFill={autoFill} />
          </div>
        )}
        <p className="mx-4 mt-3.5 text-note text-ink-muted lg:mx-8">
          <span aria-hidden="true" className="font-semibold text-danger">
            {messages.requiredMark}
          </span>{' '}
          {messages.requiredLegend}
        </p>
        <div className="grid gap-4.5 px-4 pt-2.5 lg:grid-cols-2 lg:gap-x-6 lg:px-8">
          <LeadFields
            entryType={entryType}
            workspaceId={workspaceId}
            canCreateAccounts={canCreateAccounts}
          />
          <AmountField
            isOpeningBalance={isOpeningBalance}
            warning={amountWarning}
            autoFill={autoFill}
            inputRef={amountInput}
          />
          {!isDescriptionLast && descriptionField}
          <MoneyFields
            entryType={entryType}
            workspaceId={workspaceId}
            canCreateAccounts={canCreateAccounts}
            canCreateCards={canCreateCards}
            plan={plan}
            today={today}
          />
          {isDescriptionLast && descriptionField}
          <DateField today={today} />
          {hasPaymentMethod(entryType) && (
            <FormField<EntryFormInput> name="paymentMethod" label={fields.paymentMethod}>
              {(control) => (
                <Select
                  title={fields.paymentMethod}
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

function prefilled(blank: EntryFormInput, prefill: EntryPrefill): EntryFormInput {
  const entryType = prefill.entryType ?? blank.entryType
  return {
    ...blank,
    entryType,
    description: entryType === OPENING_BALANCE ? messages.openingDescription : blank.description,
    accountId: prefill.accountId ?? blank.accountId,
    cardAccountId: prefill.cardAccountId ?? blank.cardAccountId,
    invoiceId: prefill.invoiceId ?? blank.invoiceId,
  }
}

function blankExpense(today: string, spentByUserId: string): EntryFormInput {
  return {
    entryType: 'expense',
    amount: '',
    description: '',
    accountId: '',
    toAccountId: '',
    cardAccountId: '',
    invoiceId: '',
    contactId: '',
    installmentCount: 1,
    isInProgress: false,
    isNegative: false,
    firstInstallment: 1,
    categoryId: '',
    occurredOn: today,
    paymentMethod: '',
    spentByUserId,
    shares: [],
    notes: '',
  }
}

function closedInvoiceProblem(error: unknown, plan: CardPlan | undefined): string | undefined {
  const isClosed = error instanceof ApiError && error.code === INVOICE_CLOSED
  if (!isClosed || !plan?.closedAt || !plan.firstOpen) {
    return undefined
  }
  return entriesMessages.cards.closed(
    formatMonthName(plan.closedAt.invoice.referenceMonth),
    plan.firstOpen,
  )
}

function fieldMessageOf(field: keyof EntryFormInput, error: unknown): string {
  return field === 'contactId'
    ? entriesMessages.settlements.gone
    : errorMessageFor(error, { Conta: fields.paidFrom })
}

function paymentMethodFor(
  entryType: FormEntryType,
  current: EntryFormInput['paymentMethod'],
): EntryFormInput['paymentMethod'] {
  if (entryType === CARD_PURCHASE) {
    return current === '' ? CREDIT : current
  }
  return current === CREDIT ? '' : current
}

function categoryKindOf(entryType: FormEntryType): string | undefined {
  if (!hasCategory(entryType)) {
    return undefined
  }
  return entryType === 'income' ? 'income' : 'expense'
}

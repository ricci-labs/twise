import { PAYMENT_METHODS } from '@financas/shared'
import { FormField } from '@web/components/forms/form-field'
import { Select } from '@web/components/inputs/select'
import { TextArea } from '@web/components/inputs/text-area'
import { AmountField } from '@web/features/entries/components/amount-field'
import { DateField } from '@web/features/entries/components/date-field'
import { DescriptionField } from '@web/features/entries/components/description-field'
import { hasPaymentMethod, isSpending } from '@web/features/entries/components/entry-kind'
import { MembersField } from '@web/features/entries/components/members-field'
import { LeadFields, MoneyFields } from '@web/features/entries/components/money-fields'
import { RecentRow } from '@web/features/entries/components/recent-row'
import { SharesField } from '@web/features/entries/components/shares-field'
import { TypePills } from '@web/features/entries/components/type-pills'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { EntryFormFieldsProps, EntryFormInput } from '@web/features/entries/entries.types'

const messages = entriesMessages.newEntry
const fields = entriesMessages.fields
const OPENING_BALANCE = 'opening_balance'
const SETTLEMENT = 'settlement'
const PAYMENT_OPTIONS = PAYMENT_METHODS.map((method) => ({
  value: method,
  label: entriesMessages.paymentMethods[method],
}))

export function EntryFormFields({
  workspaceId,
  entryType,
  canSeeMembers,
  canSeeContacts,
  canCreateAccounts,
  canCreateCards,
  canCreateContacts,
  isNewForm,
  autoFill,
  amountInput,
  amountWarning,
  plan,
  today,
  currentUserName,
  shareTotals,
  onTypeChange,
}: EntryFormFieldsProps) {
  const isOpeningBalance = entryType === OPENING_BALANCE
  const isDescriptionLast = entryType === 'invoice_payment' || entryType === SETTLEMENT
  const isSpendingEntry = isSpending(entryType)
  const descriptionField = (
    <DescriptionField workspaceId={workspaceId} entryType={entryType} autoFill={autoFill} />
  )
  return (
    <>
      <TypePills value={entryType} canSeeContacts={canSeeContacts} onChange={onTypeChange} />
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
          canCreateContacts={canCreateContacts}
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
              canCreateContacts={canCreateContacts}
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
    </>
  )
}

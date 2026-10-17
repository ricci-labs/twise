import { AccountField } from '@web/features/entries/components/account-field'
import { CardField } from '@web/features/entries/components/card-field'
import { CardInstallments } from '@web/features/entries/components/card-installments'
import { CategoryField } from '@web/features/entries/components/category-field'
import { ContactField } from '@web/features/entries/components/contact-field'
import { InvoiceField, PaymentAccountField } from '@web/features/entries/components/invoice-field'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { LeadFieldsProps, MoneyFieldsProps } from '@web/features/entries/entries.types'

const fields = entriesMessages.fields

export function LeadFields({
  entryType,
  workspaceId,
  canCreateAccounts,
  canCreateContacts,
}: LeadFieldsProps) {
  if (entryType === 'settlement') {
    return <ContactField workspaceId={workspaceId} canCreateContacts={canCreateContacts} />
  }
  if (entryType === 'opening_balance') {
    return (
      <AccountField
        workspaceId={workspaceId}
        canCreateAccounts={canCreateAccounts}
        label={fields.account}
        detail="kind"
      />
    )
  }
  return null
}

export function MoneyFields({
  entryType,
  workspaceId,
  canCreateAccounts,
  canCreateCards,
  plan,
  today,
}: MoneyFieldsProps) {
  const account = (label: string, name?: 'toAccountId') => (
    <AccountField
      workspaceId={workspaceId}
      canCreateAccounts={canCreateAccounts}
      name={name}
      label={label}
    />
  )

  if (entryType === 'card_purchase') {
    return (
      <>
        <CardField workspaceId={workspaceId} canCreateCards={canCreateCards} />
        <CardInstallments plan={plan} today={today} />
        <CategoryField workspaceId={workspaceId} kind="expense_category" />
      </>
    )
  }
  if (entryType === 'opening_balance') {
    return null
  }
  if (entryType === 'invoice_payment') {
    return (
      <>
        <CardField workspaceId={workspaceId} canCreateCards={canCreateCards} />
        <div className="lg:col-span-2">
          <InvoiceField workspaceId={workspaceId} />
        </div>
        <PaymentAccountField workspaceId={workspaceId} canCreateAccounts={canCreateAccounts} />
      </>
    )
  }
  if (entryType === 'transfer') {
    return (
      <>
        {account(fields.from)}
        {account(fields.to, 'toAccountId')}
      </>
    )
  }
  if (entryType === 'settlement') {
    return account(fields.receivedIn)
  }
  if (entryType === 'income') {
    return (
      <>
        {account(fields.receivedIn)}
        <CategoryField workspaceId={workspaceId} kind="income_category" />
      </>
    )
  }
  return (
    <>
      {account(fields.paidFrom)}
      <CategoryField workspaceId={workspaceId} kind="expense_category" />
    </>
  )
}

import { AccountField } from '@web/features/entries/components/account-field'
import { CardField } from '@web/features/entries/components/card-field'
import { CardInstallments } from '@web/features/entries/components/card-installments'
import { CategoryField } from '@web/features/entries/components/category-field'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { MoneyFieldsProps } from '@web/features/entries/entries.types'

const fields = entriesMessages.fields

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
  if (entryType === 'transfer') {
    return (
      <>
        {account(fields.from)}
        {account(fields.to, 'toAccountId')}
      </>
    )
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

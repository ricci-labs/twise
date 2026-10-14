import { formatBrl, MONEY_ACCOUNT_KINDS } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { FormField } from '@web/components/forms/form-field'
import {
  accountsQueryOptions,
  balancesQueryOptions,
  latestEntriesQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { EntryPicker } from '@web/features/entries/components/entry-picker'
import { preferredAccountOf } from '@web/features/entries/components/preferred-account'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  AccountBalance,
  AccountFieldProps,
  ExpenseFormInput,
  LatestEntry,
  LedgerAccount,
} from '@web/features/entries/entries.types'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

const messages = entriesMessages.accounts
const MONEY_KINDS: readonly string[] = MONEY_ACCOUNT_KINDS

export function AccountField({ workspaceId, canCreateAccounts }: AccountFieldProps) {
  const navigate = useNavigate()
  const accounts = useQuery(accountsQueryOptions(workspaceId)).data ?? []
  const balances = useQuery(balancesQueryOptions(workspaceId)).data ?? []
  const items = accounts.filter(isUsableMoneyAccount).map((account) => ({
    value: account.id,
    label: account.name,
    icon: account.icon,
    detail: balanceText(account.id, balances),
  }))
  usePreferredAccount(
    items.map((item) => item.value),
    useQuery(latestEntriesQueryOptions(workspaceId)).data?.items,
  )

  return (
    <FormField<ExpenseFormInput>
      name="paidFromAccountId"
      label={entriesMessages.fields.paidFrom}
      isRequired
    >
      {(control) => (
        <EntryPicker
          control={control}
          title={entriesMessages.fields.paidFrom}
          subtitle={messages.subtitle}
          placeholder={messages.placeholder}
          items={items}
          empty={{
            icon: 'wallet',
            title: messages.empty.title,
            text: messages.empty.text,
            ...(canCreateAccounts && {
              actionLabel: messages.empty.action,
              onAction: () =>
                navigate({ to: '.', search: (previous) => ({ ...previous, account: 'new' }) }),
            }),
          }}
        />
      )}
    </FormField>
  )
}

function usePreferredAccount(
  usableAccountIds: readonly string[],
  latestEntries: readonly LatestEntry[] | undefined,
) {
  const { getValues, resetField } = useFormContext<ExpenseFormInput>()
  const preferred = latestEntries && preferredAccountOf(usableAccountIds, latestEntries)

  useEffect(() => {
    if (preferred && getValues('paidFromAccountId') === '') {
      resetField('paidFromAccountId', { defaultValue: preferred })
    }
  }, [preferred, getValues, resetField])
}

function isUsableMoneyAccount(account: LedgerAccount): boolean {
  return MONEY_KINDS.includes(account.kind) && !account.isSystem && account.archivedAt === null
}

function balanceText(accountId: string, balances: readonly AccountBalance[]): string | undefined {
  const balance = balances.find((item) => item.accountId === accountId)
  return balance ? messages.balance(formatBrl(balance.naturalBalanceCents)) : undefined
}

import { formatBrl, MONEY_ACCOUNT_KINDS } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { type FieldControlProps, FormField } from '@web/components/forms/form-field'
import type { PickerItem } from '@web/components/inputs/picker-sheet'
import { balancesQueryOptions } from '@web/features/planning/api/planning.queries'
import { categoryKindOf } from '@web/features/planning/components/recurrence-input'
import { RecurrencePicker } from '@web/features/planning/components/recurrence-picker'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  CategoryKind,
  PlanningAccount,
  PlanningBalance,
  RecurrenceAccountFieldsProps,
  RecurrenceFormInput,
} from '@web/features/planning/planning.types'
import { useWatch } from 'react-hook-form'

const messages = planningMessages.form
const MONEY_KINDS: readonly string[] = MONEY_ACCOUNT_KINDS
const CARD_KIND = 'credit_card'
const CARD_ICON = 'card'
const WALLET_ICON = 'wallet'
const MONEY = 'money'
const INCOME_CATEGORY = 'income_category'

export function RecurrenceAccountFields({ workspaceId, accounts }: RecurrenceAccountFieldsProps) {
  const entryType = useWatch<RecurrenceFormInput, 'entryType'>({ name: 'entryType' })
  const balances = useQuery(balancesQueryOptions(workspaceId)).data ?? []
  const moneyAccounts = accounts.filter(isUsableMoneyAccount).map((account) => ({
    value: account.id,
    label: account.name,
    icon: account.icon,
    detail: balanceText(account.id, balances),
  }))
  const categoryKind = categoryKindOf(entryType)
  const isCard = entryType === 'card_purchase'
  const isTransfer = categoryKind === MONEY
  return (
    <>
      <FormField<RecurrenceFormInput>
        name="sourceAccountId"
        label={messages.source[entryType]}
        isRequired
      >
        {(control) =>
          isCard ? (
            <CardPicker control={control} accounts={accounts} />
          ) : (
            <MoneyPicker
              control={control}
              title={messages.source[entryType]}
              items={moneyAccounts}
            />
          )
        }
      </FormField>
      <FormField<RecurrenceFormInput>
        name="categoryAccountId"
        label={isTransfer ? messages.target : messages.category}
        isRequired
      >
        {(control) =>
          isTransfer ? (
            <MoneyPicker control={control} title={messages.target} items={moneyAccounts} />
          ) : (
            <CategoryPicker control={control} accounts={accounts} kind={categoryKind} />
          )
        }
      </FormField>
    </>
  )
}

function MoneyPicker({
  control,
  title,
  items,
}: {
  control: FieldControlProps
  title: string
  items: readonly PickerItem[]
}) {
  return (
    <RecurrencePicker
      control={control}
      title={title}
      subtitle={messages.accounts.subtitle}
      placeholder={messages.accounts.placeholder}
      items={items}
      empty={{ icon: WALLET_ICON, ...messages.accounts.empty }}
    />
  )
}

function CardPicker({
  control,
  accounts,
}: {
  control: FieldControlProps
  accounts: readonly PlanningAccount[]
}) {
  return (
    <RecurrencePicker
      control={control}
      title={messages.source.card_purchase}
      subtitle={messages.cards.subtitle}
      placeholder={messages.cards.placeholder}
      items={accounts.filter(isUsableCard).map(cardItem)}
      empty={{ icon: CARD_ICON, ...messages.cards.empty }}
    />
  )
}

function CategoryPicker({
  control,
  accounts,
  kind,
}: {
  control: FieldControlProps
  accounts: readonly PlanningAccount[]
  kind: CategoryKind
}) {
  const texts = kind === INCOME_CATEGORY ? messages.categories.income : messages.categories.expense
  return (
    <RecurrencePicker
      control={control}
      title={messages.category}
      subtitle={texts.subtitle}
      placeholder={messages.categories.placeholder}
      items={categoryTree(accounts.filter((account) => isUsableCategory(account, kind)))}
      layout="grid"
      searchLabel={messages.categories.search}
      empty={{ icon: kind === INCOME_CATEGORY ? 'coin' : 'receipt', ...texts.empty }}
    />
  )
}

function isUsableMoneyAccount(account: PlanningAccount): boolean {
  return MONEY_KINDS.includes(account.kind) && !account.isSystem && account.archivedAt === null
}

function isUsableCard(account: PlanningAccount): boolean {
  return account.kind === CARD_KIND && account.archivedAt === null
}

function isUsableCategory(account: PlanningAccount, kind: CategoryKind): boolean {
  return account.kind === kind && !account.isSystem && account.archivedAt === null
}

function balanceText(accountId: string, balances: readonly PlanningBalance[]): string | undefined {
  const balance = balances.find((item) => item.accountId === accountId)
  return balance ? messages.accounts.balance(formatBrl(balance.naturalBalanceCents)) : undefined
}

function cardItem(card: PlanningAccount): PickerItem {
  return { value: card.id, label: card.name, icon: card.icon ?? CARD_ICON }
}

function categoryTree(categories: readonly PlanningAccount[]): PickerItem[] {
  const ids = new Set(categories.map((category) => category.id))
  const isTop = (category: PlanningAccount) => !category.parentId || !ids.has(category.parentId)
  return categories.filter(isTop).map((parent) => {
    const children = categories
      .filter((category) => category.parentId === parent.id)
      .map((child) => ({ value: child.id, label: child.name, icon: child.icon }))
    return {
      value: parent.id,
      label: parent.name,
      icon: parent.icon,
      children: children.length > 0 ? children : undefined,
    }
  })
}

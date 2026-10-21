import { FREE_MONEY_ACCOUNT_KINDS, formatBrl } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { FormField } from '@web/components/forms/form-field'
import type { PickerItem } from '@web/components/inputs/picker-sheet'
import { balancesQueryOptions } from '@web/features/planning/api/planning.queries'
import { RecurrencePicker } from '@web/features/planning/components/recurrence-picker'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  GoalAccountFieldProps,
  GoalFormValues,
  PlanningAccount,
  PlanningBalance,
  PlanningGoal,
} from '@web/features/planning/planning.types'

const messages = planningMessages.goals.form
const MONEY_KINDS: readonly string[] = FREE_MONEY_ACCOUNT_KINDS
const WALLET_ICON = 'wallet'
const ACCOUNT_FOR_FORM = 'form'

export function GoalAccountField({
  workspaceId,
  accounts,
  goals,
  editingGoalId,
}: GoalAccountFieldProps) {
  const navigate = useNavigate()
  const balances = useQuery(balancesQueryOptions(workspaceId)).data ?? []
  const takenBy = new Map(
    goals.filter((goal) => goal.id !== editingGoalId).map((goal) => [goal.accountId, goal]),
  )
  const items = accounts
    .filter(isUsableMoneyAccount)
    .map((account) => itemOf(account, takenBy.get(account.id), balances))
  return (
    <FormField<GoalFormValues> name="accountId" label={messages.account} isRequired>
      {(control) => (
        <RecurrencePicker
          control={control}
          title={messages.account}
          subtitle={messages.accountSubtitle}
          placeholder={messages.accountPlaceholder}
          items={items}
          empty={{ icon: WALLET_ICON, ...messages.accountsEmpty }}
          action={{
            label: messages.createAccount,
            detail: messages.createAccountDetail,
            onPress: () =>
              void navigate({
                to: '.',
                search: (previous) => ({
                  ...previous,
                  account: 'new',
                  accountFor: ACCOUNT_FOR_FORM,
                }),
              }),
          }}
        />
      )}
    </FormField>
  )
}

function itemOf(
  account: PlanningAccount,
  goal: PlanningGoal | undefined,
  balances: readonly PlanningBalance[],
): PickerItem {
  return {
    value: account.id,
    label: account.name,
    icon: account.icon ?? WALLET_ICON,
    detail: goal ? takenText(goal) : balanceText(account.id, balances),
    isDisabled: goal !== undefined,
  }
}

function takenText(goal: PlanningGoal): string {
  return goal.isReserve ? messages.reserveTaken : messages.accountTaken(goal.name)
}

function balanceText(accountId: string, balances: readonly PlanningBalance[]): string | undefined {
  const balance = balances.find((item) => item.accountId === accountId)
  return balance
    ? planningMessages.form.accounts.balance(formatBrl(balance.naturalBalanceCents))
    : undefined
}

function isUsableMoneyAccount(account: PlanningAccount): boolean {
  return MONEY_KINDS.includes(account.kind) && !account.isSystem && account.archivedAt === null
}

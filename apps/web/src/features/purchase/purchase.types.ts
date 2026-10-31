import type { IsoDate } from '@financas/shared'
import type { UseQueryResult } from '@tanstack/react-query'
import type { PickerItem } from '@web/components/inputs/picker-sheet'
import type {
  fetchAccounts,
  fetchBalances,
  fetchCards,
  fetchSimulation,
} from '@web/features/purchase/api/purchase.queries'

export type PurchaseCard = Awaited<ReturnType<typeof fetchCards>>[number]

export type PurchaseAccount = Awaited<ReturnType<typeof fetchAccounts>>[number]

export type PurchaseBalance = Awaited<ReturnType<typeof fetchBalances>>[number]

export type PurchaseImpact = Awaited<ReturnType<typeof fetchSimulation>>

export type PurchaseInsight = PurchaseImpact['newInsights'][number]

export type SimulationQuery = Parameters<typeof fetchSimulation>[1]

export type PaymentChoice = 'card' | 'account'

export type PurchaseDraft = {
  amount: string
  payment: PaymentChoice
  cardAccountId: string
  installmentCount: number
  paidFromAccountId: string
  occurredOn: IsoDate
}

export type PurchaseNames = {
  cardName: string | undefined
  accountName: string | undefined
  nameOf: (id: string | null) => string
}

export type RichSentence = {
  template: string
  values: Readonly<Record<string, string | number>>
}

export type LiveSimulation = {
  query: SimulationQuery | null
  isWaiting: boolean
  result: UseQueryResult<PurchaseImpact>
}

export type PurchasePageProps = {
  workspaceId: string
}

export type PurchaseFormProps = {
  workspaceId: string
  draft: PurchaseDraft
  today: IsoDate
  cards: readonly PurchaseCard[]
  accounts: readonly PurchaseAccount[]
  balances: readonly PurchaseBalance[]
  onChange: (change: Partial<PurchaseDraft>) => void
}

export type PurchaseResultProps = {
  live: LiveSimulation
  names: PurchaseNames
}

export type PurchaseShownProps = {
  impact: PurchaseImpact
  names: PurchaseNames
}

export type PurchasePickerProps = {
  label: string
  placeholder: string
  items: readonly PickerItem[]
  value: string
  empty: { title: string; text: string; icon: string }
  onSelect: (value: string) => void
}

export type PurchasePlanProps = {
  card: PurchaseCard
  totalCents: number
  count: number
  purchaseDate: IsoDate
  today: IsoDate
}

export type PurchaseScreenProps = PurchasePageProps & {
  cards: readonly PurchaseCard[]
  accounts: readonly PurchaseAccount[]
  balances: readonly PurchaseBalance[]
}

export type PurchaseFailedProps = {
  result: LiveSimulation['result']
}

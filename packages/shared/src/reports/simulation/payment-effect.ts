import { balanceToday } from '@shared/reports/metrics/balance-forecast'
import { cardFreeLimitCents } from '@shared/reports/metrics/facts'
import type { PeriodFacts } from '@shared/reports/metrics/metrics.types'
import type {
  AccountImpact,
  CardImpact,
  SimulatedPurchase,
} from '@shared/reports/simulation/simulation.types'

export function cardImpactOf(
  before: PeriodFacts,
  after: PeriodFacts,
  purchase: SimulatedPurchase,
): CardImpact | null {
  const { card } = purchase
  if (!card) {
    return null
  }
  return {
    accountId: card.accountId,
    limitCents: card.limitCents,
    freeBeforeCents: cardFreeLimitCents(before, card),
    freeAfterCents: cardFreeLimitCents(after, card),
  }
}

export function accountImpactOf(
  before: PeriodFacts,
  after: PeriodFacts,
  purchase: SimulatedPurchase,
): AccountImpact | null {
  const accountId = purchase.card ? null : purchase.paidFromAccountId
  if (!accountId) {
    return null
  }
  return {
    accountId,
    balanceTodayBeforeCents: balanceToday(before, accountId),
    balanceTodayAfterCents: balanceToday(after, accountId),
  }
}

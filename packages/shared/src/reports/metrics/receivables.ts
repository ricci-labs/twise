import { sumCents } from '@shared/reports/metrics/facts'
import type {
  NextReceivable,
  PeriodFacts,
  Receivables,
} from '@shared/reports/metrics/metrics.types'

export function receivables(facts: PeriodFacts): Receivables | null {
  const owing = facts.contactBalances.filter((balance) => balance.owedCents > 0)
  if (owing.length === 0) {
    return null
  }
  const next = owing
    .flatMap((balance): NextReceivable[] =>
      balance.nextDueOn
        ? [
            {
              contactId: balance.contactId,
              dueOn: balance.nextDueOn,
              amountCents: balance.nextDueCents,
            },
          ]
        : [],
    )
    .sort((left, right) => left.dueOn.localeCompare(right.dueOn))[0]
  return {
    owedCents: sumCents(owing.map((balance) => balance.owedCents)),
    overdueCents: sumCents(owing.map((balance) => balance.overdueCents)),
    contactCount: owing.length,
    next: next ?? null,
  }
}

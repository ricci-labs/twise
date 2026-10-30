import type { InsightRule } from '@shared/reports/insights/insights.types'
import { cardFreeLimitCents } from '@shared/reports/metrics/facts'

export const cardLimitExceeded: InsightRule = (facts) =>
  facts.cards.flatMap((card) => {
    const freeCents = cardFreeLimitCents(facts, card)
    if (card.limitCents === null || freeCents === null || freeCents >= 0) {
      return []
    }
    return [
      {
        code: 'card_limit_exceeded' as const,
        severity: 'alert' as const,
        subject: card.accountId,
        values: { limitCents: card.limitCents, exceededCents: -freeCents },
      },
    ]
  })

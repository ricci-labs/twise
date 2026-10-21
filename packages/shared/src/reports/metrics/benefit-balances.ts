import type { IsoDate } from '@shared/core/calendar/calendar.types'
import { addDays, daysBetween } from '@shared/core/calendar/dates'
import { BENEFIT_ACCOUNT_KIND } from '@shared/ledger/ledger/ledger.constants'
import { balanceToday } from '@shared/reports/metrics/balance-forecast'
import { sumCents } from '@shared/reports/metrics/facts'
import type {
  BenefitBalance,
  BenefitCredit,
  FactPosting,
  PeriodFacts,
} from '@shared/reports/metrics/metrics.types'

const INCOME = 'income'
const PENDING = 'pending'
const TODAY_COUNTS = 1

export function benefitBalances(facts: PeriodFacts): BenefitBalance[] {
  return facts.accounts
    .filter((account) => account.kind === BENEFIT_ACCOUNT_KIND)
    .map((account) => benefitBalanceOf(facts, account.id))
}

function benefitBalanceOf(facts: PeriodFacts, accountId: string): BenefitBalance {
  const moves = facts.postings.filter(
    (posting) => posting.accountId === accountId && posting.effectiveOn <= facts.today,
  )
  const spentSince = lastCreditOn(moves) ?? facts.period.start
  const spentCents = sumCents(
    moves
      .filter((posting) => posting.amountCents < 0 && posting.effectiveOn >= spentSince)
      .map((posting) => -posting.amountCents),
  )
  const dailySpendCents = Math.floor(
    spentCents / (daysBetween(spentSince, facts.today) + TODAY_COUNTS),
  )
  const balanceCents = balanceToday(facts, accountId)
  return {
    accountId,
    balanceCents,
    spentSince,
    spentCents,
    dailySpendCents,
    lastsUntil: lastsUntilOf(facts.today, balanceCents, dailySpendCents),
    nextCredit: nextCreditOf(facts, accountId),
  }
}

function lastCreditOn(moves: readonly FactPosting[]): IsoDate | null {
  const credits = moves
    .filter((posting) => posting.amountCents > 0)
    .map((posting) => posting.effectiveOn)
    .sort()
  return credits.at(-1) ?? null
}

function lastsUntilOf(today: IsoDate, balanceCents: number, dailySpendCents: number) {
  if (dailySpendCents <= 0 || balanceCents <= 0) {
    return null
  }
  return addDays(today, Math.floor(balanceCents / dailySpendCents))
}

function nextCreditOf(facts: PeriodFacts, accountId: string): BenefitCredit | null {
  const next = facts.occurrences
    .filter(
      (occurrence) =>
        occurrence.entryType === INCOME &&
        occurrence.status === PENDING &&
        occurrence.sourceAccountId === accountId &&
        occurrence.dueOn >= facts.today,
    )
    .sort((left, right) => left.dueOn.localeCompare(right.dueOn))[0]
  return next ? { dueOn: next.dueOn, amountCents: next.amountCents } : null
}

import { entryAmountCents, entrySharesOf } from '@shared/ledger/ledger/ledger'
import { type AccountKind, MONEY_ACCOUNT_KINDS } from '@shared/ledger/ledger/ledger.constants'
import type { EntrySplit, SplitPosting } from '@shared/ledger/shares/entry-split.types'

const FUNDING_KINDS: ReadonlySet<AccountKind> = new Set([...MONEY_ACCOUNT_KINDS, 'credit_card'])

export function entrySplitOf(postings: readonly SplitPosting[]): EntrySplit {
  const totalCents = entryAmountCents(postings)
  const shares = entrySharesOf(postings).map((share) => share.amountCents)
  const ownCents = totalCents - shares.reduce((total, share) => total + share, 0)
  const parts = ownCents > 0 ? [...shares, ownCents] : shares
  return {
    paidFrom: fundingPostingOf(postings)?.accountName ?? null,
    entryAmountCents: totalCents,
    partCount: parts.length,
    isEvenSplit: Math.max(...parts) - Math.min(...parts) < parts.length,
  }
}

function fundingPostingOf(postings: readonly SplitPosting[]): SplitPosting | undefined {
  return postings.find(
    (posting) => posting.amountCents < 0 && FUNDING_KINDS.has(posting.accountKind),
  )
}

import { systemClock } from '@api/core/clock'
import type { Clock } from '@api/core/clock.types'
import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import { withWorkspace } from '@api/core/db/tx'
import {
  selectAccountBalances,
  selectActiveAccounts,
  selectActiveCards,
  selectInvoiceTotalsDueFrom,
} from '@api/modules/ledger/ledger.repository'
import type {
  AccountBalance,
  AccountsSummary,
  CardItem,
  CardSummary,
  InvoiceSnapshot,
  StoredInvoiceTotal,
  UpcomingInvoice,
} from '@api/modules/ledger/ledger.types'
import { currentWorkspaceDefaults } from '@api/modules/workspaces'
import {
  addDays,
  type InvoiceRef,
  type IsoDate,
  invoiceForPurchase,
  invoiceStatusOn,
  isMoneyAccountKind,
  parseIsoDate,
  todayIn,
  toYearMonthLabel,
  type UpcomingInvoiceQuery,
} from '@financas/shared'

const PERCENT = 100

const CLOSED = 'closed'

export function listCardSummaries(
  db: Database,
  workspaceId: string,
  clock: Clock = systemClock,
): Promise<CardSummary[]> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const today = await todayOf(tx, clock)
    const cards = await selectActiveCards(tx)
    const balances = await selectAccountBalances(tx)
    const invoices = await selectInvoiceTotalsDueFrom(tx, today)
    return cards.map((card) => {
      const openCents = openCentsOf(card.accountId, balances)
      return {
        ...card,
        openCents,
        limitUsedPercent: limitUsedPercentOf(openCents, card.limitCents),
        currentInvoice: snapshotOf(card, invoiceForPurchase(today, card), invoices, today),
      }
    })
  })
}

export function listUpcomingInvoices(
  db: Database,
  workspaceId: string,
  query: UpcomingInvoiceQuery,
  clock: Clock = systemClock,
): Promise<UpcomingInvoice[]> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const today = await todayOf(tx, clock)
    const cards = usableCards(await selectActiveCards(tx))
    return (await upcomingInvoicesOf(tx, cards, today)).slice(0, query.limit)
  })
}

export function readAccountsSummary(
  db: Database,
  workspaceId: string,
  clock: Clock = systemClock,
): Promise<AccountsSummary> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const today = await todayOf(tx, clock)
    const moneyAccounts = (await selectActiveAccounts(tx)).filter(
      (account) => isMoneyAccountKind(account.kind) && !account.isSystem && !account.archivedAt,
    )
    const cards = usableCards(await selectActiveCards(tx))
    const balances = await selectAccountBalances(tx)
    const upcoming = await upcomingInvoicesOf(tx, cards, today)
    return {
      moneyTotalCents: sumOpenCents(
        moneyAccounts.map((account) => account.id),
        balances,
      ),
      moneyAccountCount: moneyAccounts.length,
      cardsOpenCents: sumOpenCents(
        cards.map((card) => card.accountId),
        balances,
      ),
      cardCount: cards.length,
      nextInvoice: upcoming.find((invoice) => invoice.dueCents > 0) ?? null,
    }
  })
}

async function todayOf(tx: WorkspaceTransaction, clock: Clock): Promise<IsoDate> {
  const { timezone } = await currentWorkspaceDefaults(tx)
  return todayIn(timezone, clock.now())
}

function usableCards(cards: CardItem[]): CardItem[] {
  return cards.filter((card) => !card.archivedAt)
}

async function upcomingInvoicesOf(
  tx: WorkspaceTransaction,
  cards: CardItem[],
  today: IsoDate,
): Promise<UpcomingInvoice[]> {
  const invoices = await selectInvoiceTotalsDueFrom(tx, today)
  const cycles = cards.flatMap((card) =>
    nextCyclesOf(card, today).map((ref) => upcomingOf(card, ref, invoices, today)),
  )
  const closedUnpaid = invoices
    .filter((invoice) => invoice.dueCents > 0)
    .flatMap((invoice) => {
      const card = cards.find((candidate) => candidate.accountId === invoice.cardAccountId)
      return card ? [upcomingOf(card, refOf(invoice), invoices, today)] : []
    })
    .filter((invoice) => invoice.status === CLOSED)
  return [...closedUnpaid, ...cycles].sort((first, second) =>
    first.dueOn.localeCompare(second.dueOn),
  )
}

function nextCyclesOf(card: CardItem, today: IsoDate): InvoiceRef[] {
  const current = invoiceForPurchase(today, card)
  return [current, invoiceForPurchase(addDays(current.closingOn, 1), card)]
}

function upcomingOf(
  card: CardItem,
  ref: InvoiceRef,
  invoices: StoredInvoiceTotal[],
  today: IsoDate,
): UpcomingInvoice {
  return { cardAccountId: card.accountId, ...snapshotOf(card, ref, invoices, today) }
}

function snapshotOf(
  card: CardItem,
  ref: InvoiceRef,
  invoices: StoredInvoiceTotal[],
  today: IsoDate,
): InvoiceSnapshot {
  const stored = invoices.find(
    (invoice) => invoice.cardAccountId === card.accountId && invoice.closingOn === ref.closingOn,
  )
  return {
    invoiceId: stored?.invoiceId ?? null,
    referenceMonth: ref.referenceMonth,
    closingOn: ref.closingOn,
    dueOn: ref.dueOn,
    status: invoiceStatusOn(ref, today, card),
    totalCents: stored?.totalCents ?? 0,
    dueCents: stored?.dueCents ?? 0,
  }
}

function refOf(invoice: StoredInvoiceTotal): InvoiceRef {
  return {
    referenceMonth: toYearMonthLabel(parseIsoDate(invoice.referenceMonth)),
    closingOn: invoice.closingOn,
    dueOn: invoice.dueOn,
  }
}

function openCentsOf(accountId: string, balances: AccountBalance[]): number {
  return balances.find((balance) => balance.accountId === accountId)?.naturalBalanceCents ?? 0
}

function sumOpenCents(accountIds: string[], balances: AccountBalance[]): number {
  return accountIds.reduce((sum, accountId) => sum + openCentsOf(accountId, balances), 0)
}

function limitUsedPercentOf(openCents: number, limitCents: number | null): number | null {
  if (!limitCents) {
    return null
  }
  return Math.round((Math.max(openCents, 0) * PERCENT) / limitCents)
}

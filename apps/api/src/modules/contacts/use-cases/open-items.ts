import { systemClock } from '@api/core/clock'
import type { Clock } from '@api/core/clock.types'
import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import { withWorkspace } from '@api/core/db/tx'
import { NotFoundError } from '@api/core/http/errors'
import {
  selectActiveContact,
  selectActiveContacts,
  selectChargeItems,
  selectOpenCharges,
} from '@api/modules/contacts/contacts.repository'
import type {
  OpenChargeFacts,
  OpenItemsRef,
  SplitOpenItem,
} from '@api/modules/contacts/contacts.types'
import { paidByCharge } from '@api/modules/contacts/use-cases/charges'
import { readContactItems, readContactItemsByContact, readEntrySplits } from '@api/modules/ledger'
import { currentWorkspaceSettings } from '@api/modules/workspaces'
import {
  type ChargeMark,
  chargeStatusOf,
  type EntrySplit,
  markedOpenItems,
  type OpenItemsQuery,
  todayIn,
  type UpcomingItem,
  upcomingItems,
} from '@financas/shared'

const NO_SPLIT: EntrySplit = {
  paidFrom: null,
  entryAmountCents: 0,
  partCount: 1,
  isEvenSplit: true,
}

export function listOpenItems(
  db: Database,
  { workspaceId, contactId }: OpenItemsRef,
  { until, includeCharged }: OpenItemsQuery,
  clock: Clock = systemClock,
): Promise<SplitOpenItem[]> {
  return withWorkspace(db, workspaceId, async (tx) => {
    if (!(await selectActiveContact(tx, contactId))) {
      throw new NotFoundError('CONTACT_NOT_FOUND', `Contact ${contactId} not found`)
    }
    const { timezone } = await currentWorkspaceSettings(tx)
    const { items, paidCents } = await readContactItems(tx, contactId)
    const { marks } = await readOpenChargeFacts(tx, timezone, contactId)
    const open = markedOpenItems(items, paidCents, {
      until: until ?? todayIn(timezone, clock.now()),
      marks,
      includeCharged,
    })
    const splits = await readEntrySplits(
      tx,
      open.map((item) => item.postingId),
    )
    return open.map((item) => ({ ...item, ...(splits.get(item.postingId) ?? NO_SPLIT) }))
  })
}

export function listUpcomingContactItems(
  db: Database,
  workspaceId: string,
  limit: number,
  clock: Clock = systemClock,
): Promise<UpcomingItem[]> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const { timezone } = await currentWorkspaceSettings(tx)
    const itemsByContact = await readContactItemsByContact(tx)
    const contacts = (await selectActiveContacts(tx)).flatMap((contact) => {
      const own = itemsByContact.get(contact.id)
      return own ? [{ contactId: contact.id, contactName: contact.name, ...own }] : []
    })
    return upcomingItems(contacts, { today: todayIn(timezone, clock.now()), limit })
  })
}

export async function readOpenChargeFacts(
  tx: WorkspaceTransaction,
  timezone: string,
  contactId?: string,
): Promise<OpenChargeFacts> {
  const rows = await selectOpenCharges(tx, contactId)
  if (rows.length === 0) {
    return { marks: new Map(), chargesByContact: new Map() }
  }
  const chargeIds = rows.map((row) => row.id)
  const paid = await paidByCharge(tx, chargeIds)
  const summaries = new Map(
    rows.map((row) => [
      row.id,
      {
        chargeId: row.id,
        createdOn: todayIn(timezone, row.createdAt),
        status: chargeStatusOf(row.status, row.amountCents, paid.get(row.id) ?? 0),
      },
    ]),
  )
  const marks = new Map<string, ChargeMark>()
  for (const { chargeId, postingId } of await selectChargeItems(tx, chargeIds)) {
    const charge = summaries.get(chargeId)
    if (charge) {
      marks.set(postingId, { chargeId, createdOn: charge.createdOn })
    }
  }
  const chargesByContact = new Map(
    [...Map.groupBy(rows, (row) => row.contactId)].map(([owner, own]) => [
      owner,
      own.flatMap((row) => summaries.get(row.id) ?? []),
    ]),
  )
  return { marks, chargesByContact }
}

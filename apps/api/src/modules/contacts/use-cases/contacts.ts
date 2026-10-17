import { systemClock } from '@api/core/clock'
import type { Clock } from '@api/core/clock.types'
import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import { postgresConstraintName } from '@api/core/db/errors'
import { withWorkspace } from '@api/core/db/tx'
import { ConflictError, NotFoundError, parseOrThrow } from '@api/core/http/errors'
import { auditCreation, audited } from '@api/modules/audit'
import {
  contactAuditTarget,
  insertContact,
  lockActiveContact,
  selectActiveContact,
  selectActiveContacts,
  updateContact,
} from '@api/modules/contacts/contacts.repository'
import type {
  ContactBalanceItem,
  ContactItem,
  ContactRef,
  ContactRow,
  ContactSummary,
  ContactsContext,
  CreatedContact,
  DeleteContactInput,
} from '@api/modules/contacts/contacts.types'
import { readOpenChargeFacts } from '@api/modules/contacts/use-cases/open-items'
import {
  type ContactItems,
  readContactItemsByContact,
  readContactPostings,
} from '@api/modules/ledger'
import { currentWorkspaceDefaults } from '@api/modules/workspaces'
import {
  type ContactBalance,
  contactBalances,
  contactChangeSchema,
  contactChargeState,
  type IsoDate,
  newContactSchema,
  todayIn,
} from '@financas/shared'

const CONTACT_INVALID = 'CONTACT_INVALID'

const NO_ITEMS: ContactItems = { items: [], paidCents: 0 }

const TAKEN_CHANNELS = new Map([
  [
    'contacts_one_per_phone',
    { code: 'CONTACT_PHONE_TAKEN', message: 'Another contact has this phone' },
  ],
  [
    'contacts_one_per_email',
    { code: 'CONTACT_EMAIL_TAKEN', message: 'Another contact has this email' },
  ],
])

export function listContacts(db: Database, workspaceId: string): Promise<ContactItem[]> {
  return withWorkspace(db, workspaceId, async (tx) => (await selectActiveContacts(tx)).map(itemOf))
}

export function getContact(
  db: Database,
  workspaceId: string,
  contactId: string,
): Promise<ContactItem> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const contact = await selectActiveContact(tx, contactId)
    if (!contact) {
      throw contactNotFound(contactId)
    }
    return itemOf(contact)
  })
}

export function listContactBalances(
  db: Database,
  workspaceId: string,
  clock: Clock = systemClock,
): Promise<ContactBalanceItem[]> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const { timezone } = await currentWorkspaceDefaults(tx)
    const today = todayIn(timezone, clock.now())
    const active = new Map((await selectActiveContacts(tx)).map((contact) => [contact.id, contact]))
    const itemsByContact = await readContactItemsByContact(tx)
    const { marks, chargesByContact } = await readOpenChargeFacts(tx, timezone)
    return contactBalances(await readContactPostings(tx), today)
      .flatMap((balance) => {
        const contact = active.get(balance.contactId)
        if (!contact) {
          return []
        }
        const { items, paidCents } = itemsByContact.get(contact.id) ?? NO_ITEMS
        const chargeState = contactChargeState(items, paidCents, {
          today,
          marks,
          chargesNewestFirst: chargesByContact.get(contact.id) ?? [],
        })
        return [{ ...balance, ...summaryOf(contact), ...chargeState }]
      })
      .sort((left, right) => left.name.localeCompare(right.name))
  })
}

export async function readContactBalanceFacts(
  tx: WorkspaceTransaction,
  today: IsoDate,
): Promise<ContactBalance[]> {
  const active = new Set((await selectActiveContacts(tx)).map((contact) => contact.id))
  return contactBalances(await readContactPostings(tx), today).filter((balance) =>
    active.has(balance.contactId),
  )
}

export async function createContact(
  db: Database,
  { workspaceId }: ContactsContext,
  rawInput: unknown,
): Promise<CreatedContact> {
  const contact = parseOrThrow(newContactSchema, rawInput, CONTACT_INVALID)
  return refusingTakenChannels(() =>
    withWorkspace(db, workspaceId, async (tx) => {
      const contactId = await insertContact(tx, { workspaceId, ...contact })
      await auditCreation(tx, contactAuditTarget(workspaceId, contactId))
      return { contactId }
    }),
  )
}

export async function changeContact(
  db: Database,
  { workspaceId, contactId }: ContactRef,
  rawChange: unknown,
  clock: Clock = systemClock,
): Promise<void> {
  const { isOptedOut, isArchived, ...change } = parseOrThrow(
    contactChangeSchema,
    rawChange,
    CONTACT_INVALID,
  )
  await refusingTakenChannels(() =>
    withWorkspace(db, workspaceId, async (tx) => {
      const current = await lockExistingContact(tx, contactId)
      if (isArchived) {
        await assertNothingOwed(tx, contactId)
      }
      await audited(tx, contactAuditTarget(workspaceId, contactId), 'update', () =>
        updateContact(tx, contactId, {
          ...change,
          optedOutAt:
            isOptedOut === undefined
              ? current.optedOutAt
              : optOutMoment(current, isOptedOut, clock),
          archivedAt:
            isArchived === undefined
              ? current.archivedAt
              : archiveMoment(current, isArchived, clock),
        }),
      )
    }),
  )
}

export async function deleteContact(
  db: Database,
  { workspaceId, contactId, userId, reason }: DeleteContactInput,
  clock: Clock = systemClock,
): Promise<void> {
  await withWorkspace(db, workspaceId, async (tx) => {
    await lockExistingContact(tx, contactId)
    await audited(tx, contactAuditTarget(workspaceId, contactId), 'delete', () =>
      updateContact(tx, contactId, {
        deletedAt: clock.now(),
        deletedByUserId: userId,
        deleteReason: reason ?? null,
      }),
    )
  })
}

async function lockExistingContact(
  tx: WorkspaceTransaction,
  contactId: string,
): Promise<ContactRow> {
  const contact = await lockActiveContact(tx, contactId)
  if (!contact) {
    throw contactNotFound(contactId)
  }
  return contact
}

function contactNotFound(contactId: string): NotFoundError {
  return new NotFoundError('CONTACT_NOT_FOUND', `Contact ${contactId} not found`)
}

async function assertNothingOwed(tx: WorkspaceTransaction, contactId: string): Promise<void> {
  const owed = (await readContactPostings(tx, contactId)).reduce(
    (sum, posting) => sum + posting.amountCents,
    0,
  )
  if (owed !== 0) {
    throw new ConflictError(
      'CONTACT_HAS_BALANCE',
      'Settle the balance before archiving the contact',
    )
  }
}

function archiveMoment(current: ContactRow, isArchived: boolean, clock: Clock): Date | null {
  if (!isArchived) {
    return null
  }
  return current.archivedAt ?? clock.now()
}

function optOutMoment(current: ContactRow, isOptedOut: boolean, clock: Clock): Date | null {
  if (!isOptedOut) {
    return null
  }
  return current.optedOutAt ?? clock.now()
}

async function refusingTakenChannels<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (error) {
    const taken = TAKEN_CHANNELS.get(postgresConstraintName(error) ?? '')
    if (taken) {
      throw new ConflictError(taken.code, taken.message, { cause: error })
    }
    throw error
  }
}

function summaryOf(contact: ContactRow): ContactSummary {
  return { name: contact.name, phoneE164: contact.phoneE164, email: contact.email }
}

function itemOf(contact: ContactRow): ContactItem {
  return {
    id: contact.id,
    name: contact.name,
    phoneE164: contact.phoneE164,
    email: contact.email,
    pixKey: contact.pixKey,
    notes: contact.notes,
    isOptedOut: contact.optedOutAt !== null,
    isArchived: contact.archivedAt !== null,
  }
}

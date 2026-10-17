import { systemClock } from '@api/core/clock'
import type { Clock } from '@api/core/clock.types'
import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import { withWorkspace } from '@api/core/db/tx'
import { parseOrThrow, ValidationError } from '@api/core/http/errors'
import { generateToken, hashToken, tokenMatchesHash } from '@api/core/security/tokens'
import { audited } from '@api/modules/audit'
import {
  contactAuditTarget,
  findOptOutWorkspaceId,
  insertOptOutToken,
  lockContact,
  selectLatestEmailedChargeCreator,
  selectOptOutToken,
  updateContact,
} from '@api/modules/contacts/contacts.repository'
import type { ContactRow, OptOutResult } from '@api/modules/contacts/contacts.types'
import { getAccount } from '@api/modules/identity'
import { contactOptOutRequestSchema } from '@financas/shared'

const LINK_INVALID = 'LINK_INVALID'

export async function issueOptOutToken(
  tx: WorkspaceTransaction,
  contact: ContactRow,
): Promise<string> {
  const token = generateToken()
  await insertOptOutToken(tx, {
    workspaceId: contact.workspaceId,
    contactId: contact.id,
    tokenHash: hashToken(token),
  })
  return token
}

export async function optOutByLink(
  db: Database,
  rawRequest: unknown,
  clock: Clock = systemClock,
): Promise<OptOutResult> {
  const { token } = parseOrThrow(contactOptOutRequestSchema, rawRequest, LINK_INVALID)
  const tokenHash = hashToken(token)
  const workspaceId = await findOptOutWorkspaceId(db, tokenHash)
  if (!workspaceId) {
    throw invalidLink()
  }
  const requesterId = await withWorkspace(db, workspaceId, async (tx) => {
    const stored = await selectOptOutToken(tx, tokenHash)
    const contact = stored && (await lockContact(tx, stored.contactId))
    if (!stored || !contact || !tokenMatchesHash(token, stored.tokenHash)) {
      throw invalidLink()
    }
    if (contact.optedOutVia !== 'email_link') {
      await audited(tx, contactAuditTarget(workspaceId, contact.id), 'update', () =>
        updateContact(tx, contact.id, {
          optedOutAt: contact.optedOutAt ?? clock.now(),
          optedOutVia: 'email_link',
        }),
      )
    }
    return selectLatestEmailedChargeCreator(tx, contact.id)
  })
  return { requesterName: requesterId ? (await getAccount(db, requesterId)).displayName : null }
}

function invalidLink(): ValidationError {
  return new ValidationError(LINK_INVALID, 'Opt-out link unknown')
}

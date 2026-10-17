import { systemClock } from '@api/core/clock'
import type { Clock } from '@api/core/clock.types'
import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import { ConflictError, NotFoundError } from '@api/core/http/errors'
import { audited } from '@api/modules/audit'
import { chargeEmail } from '@api/modules/contacts/contacts.emails'
import {
  chargeAuditTarget,
  lockCharge,
  selectActiveContact,
  updateCharge,
} from '@api/modules/contacts/contacts.repository'
import type { ChargeRef, ChargeRow, ContactRow } from '@api/modules/contacts/contacts.types'
import { paidByCharge, viewsOf, withOpenCharge } from '@api/modules/contacts/use-cases/charges'
import { issueOptOutToken } from '@api/modules/contacts/use-cases/opt-out'
import { getAccount } from '@api/modules/identity'
import { type DeliveryReport, enqueueNotification } from '@api/modules/notifications'
import {
  currentChargeText,
  currentWorkspaceSettings,
  findCurrentWorkspace,
} from '@api/modules/workspaces'
import { type IsoDate, todayIn } from '@financas/shared'

const SENDABLE: ChargeRow['status'][] = ['draft', 'sent']
const CHARGE_KIND = 'charge'
const EMAIL_ERROR_MAX_LENGTH = 200

export async function sendChargeEmail(
  db: Database,
  ref: ChargeRef,
  publicUrl: string,
  clock: Clock = systemClock,
): Promise<void> {
  await withOpenCharge(db, ref, SENDABLE, async (tx, charge) => {
    const contact = await sendableContact(tx, charge.contactId)
    const requester = await getAccount(db, charge.createdByUserId)
    const settings = await currentWorkspaceSettings(tx)
    const [view] = await viewsOf(tx, [charge])
    const email = chargeEmail({
      to: contact.email,
      replyTo: requester.email,
      contactName: contact.name,
      requesterName: requester.displayName,
      workspaceName: (await findCurrentWorkspace(tx))?.name ?? '',
      items: view?.items ?? [],
      totalCents: charge.amountCents,
      dueOn: charge.dueOn as IsoDate | null,
      today: todayIn(settings.timezone, clock.now()) as IsoDate,
      pix:
        charge.pixPayload && settings.pixReceiverName && settings.pixReceiverCity
          ? {
              payload: charge.pixPayload,
              receiverName: settings.pixReceiverName,
              receiverCity: settings.pixReceiverCity,
            }
          : null,
      text: await currentChargeText(tx),
      publicUrl,
      optOutToken: await issueOptOutToken(tx, contact),
    })
    await enqueueNotification(tx, {
      workspaceId: ref.workspaceId,
      recipient: { contactId: contact.id },
      channel: 'email',
      kind: CHARGE_KIND,
      payload: { chargeId: charge.id, email },
      dueAt: clock.now(),
      dedupeKey: `${CHARGE_KIND}:${charge.id}:${clock.now().toISOString()}`,
    })
    await audited(tx, chargeAuditTarget(ref.workspaceId, charge.id), 'update', () =>
      updateCharge(tx, charge.id, {
        status: 'sent',
        sentAt: clock.now(),
        sentVia: 'email',
        sentTo: contact.email,
        emailStatus: 'queued',
        emailError: null,
      }),
    )
  })
}

export async function recordChargeEmailOutcome(
  tx: WorkspaceTransaction,
  report: DeliveryReport,
): Promise<void> {
  const chargeId = report.kind === CHARGE_KIND ? chargeIdOf(report.payload) : null
  const charge = chargeId ? await lockCharge(tx, chargeId) : null
  if (charge?.sentVia !== 'email' || charge.emailStatus !== 'queued') {
    return
  }
  const paidCents = (await paidByCharge(tx, [charge.id])).get(charge.id) ?? 0
  await audited(tx, chargeAuditTarget(charge.workspaceId, charge.id), 'update', () =>
    updateCharge(
      tx,
      charge.id,
      report.outcome === 'sent'
        ? { emailStatus: 'sent' }
        : {
            emailStatus: 'failed',
            emailError: (report.error ?? '').slice(0, EMAIL_ERROR_MAX_LENGTH),
            status: charge.status === 'sent' && paidCents === 0 ? 'draft' : charge.status,
          },
    ),
  )
}

async function sendableContact(
  tx: WorkspaceTransaction,
  contactId: string,
): Promise<ContactRow & { email: string }> {
  const contact = await selectActiveContact(tx, contactId)
  if (!contact) {
    throw new NotFoundError('CONTACT_NOT_FOUND', `Contact ${contactId} not found`)
  }
  if (!contact.email) {
    throw new ConflictError('CONTACT_HAS_NO_EMAIL', `Contact ${contactId} has no e-mail`)
  }
  if (contact.optedOutAt) {
    throw new ConflictError('CONTACT_OPTED_OUT', `Contact ${contactId} opted out`)
  }
  return { ...contact, email: contact.email }
}

function chargeIdOf(payload: unknown): string | null {
  return typeof payload === 'object' &&
    payload !== null &&
    'chargeId' in payload &&
    typeof payload.chargeId === 'string'
    ? payload.chargeId
    : null
}

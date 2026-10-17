import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import { withWorkspace } from '@api/core/db/tx'
import type { EmailMessage } from '@api/core/email/email.types'
import { appMetrics } from '@api/core/observability/metrics'
import { findQuietHours, getAccount } from '@api/modules/identity'
import { notificationEmail } from '@api/modules/notifications/notifications.emails'
import {
  claimDueEmails,
  insertNotificationIfNew,
  updateNotification,
} from '@api/modules/notifications/notifications.repository'
import type {
  DeliveryDeps,
  DeliveryOutcome,
  DeliveryResult,
  EnqueuedNotification,
  NewNotification,
  NotificationRow,
} from '@api/modules/notifications/notifications.types'
import { currentWorkspaceDefaults } from '@api/modules/workspaces'
import { outsideQuietHours, preparedEmailPayloadSchema } from '@financas/shared'

const BATCH_SIZE = 20
const MAX_ATTEMPTS = 5
const BACKOFF_BASE_MS = 60_000
const PERMANENT_FAILURE_MIN = 500
const PERMANENT_FAILURE_MAX = 599

export async function enqueueNotification(
  tx: WorkspaceTransaction,
  notification: NewNotification,
): Promise<EnqueuedNotification> {
  const { recipient, dueAt, ...rest } = notification
  const scheduledFor = await scheduleFor(tx, notification)
  const isNew = await insertNotificationIfNew(tx, {
    ...rest,
    recipientUserId: 'userId' in recipient ? recipient.userId : null,
    recipientContactId: 'contactId' in recipient ? recipient.contactId : null,
    scheduledFor,
  })
  return { isNew }
}

async function scheduleFor(
  tx: WorkspaceTransaction,
  { recipient, dueAt }: NewNotification,
): Promise<Date> {
  if (!('userId' in recipient)) {
    return dueAt
  }
  const { timezone } = await currentWorkspaceDefaults(tx)
  return outsideQuietHours(dueAt, timezone, await findQuietHours(tx, recipient.userId))
}

export function deliverDueNotifications(
  db: Database,
  workspaceId: string,
  deps: DeliveryDeps,
): Promise<DeliveryResult> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const result: DeliveryResult = { sent: 0, retried: 0, failed: 0 }
    for (const notification of await claimDueEmails(tx, deps.clock.now(), BATCH_SIZE)) {
      result[await deliver(db, tx, notification, deps)] += 1
    }
    return result
  })
}

async function deliver(
  db: Database,
  tx: WorkspaceTransaction,
  notification: NotificationRow,
  deps: DeliveryDeps,
): Promise<DeliveryOutcome> {
  const outcome = await attemptDelivery(db, tx, notification, deps)
  appMetrics().notifications.add(1, {
    channel: notification.channel,
    kind: notification.kind,
    outcome,
  })
  return outcome
}

async function attemptDelivery(
  db: Database,
  tx: WorkspaceTransaction,
  notification: NotificationRow,
  deps: DeliveryDeps,
): Promise<DeliveryOutcome> {
  const message = await emailFor(db, notification, deps)
  if (!message) {
    await giveUp(tx, notification, 'Nothing to send by email for this notification', deps)
    return 'failed'
  }
  try {
    await deps.mailer.send(message)
    await updateNotification(tx, notification.id, { status: 'sent', sentAt: deps.clock.now() })
    deps.logger.info(
      { event: 'notification.sent', notificationId: notification.id, kind: notification.kind },
      'Notification sent',
    )
    await report(tx, notification, 'sent', null, deps)
    return 'sent'
  } catch (err) {
    if (isRecipientRefused(err)) {
      await giveUp(tx, notification, errorMessageOf(err), deps)
      return 'failed'
    }
    return retryOrGiveUp(tx, notification, errorMessageOf(err), deps)
  }
}

async function emailFor(
  db: Database,
  notification: NotificationRow,
  deps: DeliveryDeps,
): Promise<EmailMessage | null> {
  if (notification.recipientUserId) {
    return notificationEmail({
      kind: notification.kind,
      payload: notification.payload,
      recipient: await getAccount(db, notification.recipientUserId),
      appLink: deps.publicUrl,
    })
  }
  const prepared = preparedEmailPayloadSchema.safeParse(notification.payload)
  return prepared.success ? { template: notification.kind, ...prepared.data.email } : null
}

async function report(
  tx: WorkspaceTransaction,
  notification: NotificationRow,
  outcome: 'sent' | 'failed',
  error: string | null,
  deps: DeliveryDeps,
): Promise<void> {
  await deps.onDelivered?.(tx, {
    notificationId: notification.id,
    kind: notification.kind,
    payload: notification.payload,
    outcome,
    error,
  })
}

async function retryOrGiveUp(
  tx: WorkspaceTransaction,
  notification: NotificationRow,
  lastError: string,
  deps: DeliveryDeps,
): Promise<DeliveryOutcome> {
  const attempts = notification.attempts + 1
  if (attempts >= MAX_ATTEMPTS) {
    await giveUp(tx, notification, lastError, deps)
    return 'failed'
  }
  const retryAt = new Date(deps.clock.now().getTime() + BACKOFF_BASE_MS * 2 ** attempts)
  await updateNotification(tx, notification.id, { attempts, lastError, scheduledFor: retryAt })
  deps.logger.warn(
    { event: 'notification.failed', notificationId: notification.id, attempts, willRetry: true },
    'Notification failed, will retry',
  )
  return 'retried'
}

async function giveUp(
  tx: WorkspaceTransaction,
  notification: NotificationRow,
  lastError: string,
  deps: DeliveryDeps,
): Promise<void> {
  await updateNotification(tx, notification.id, {
    status: 'failed',
    attempts: notification.attempts + 1,
    lastError,
  })
  deps.logger.warn(
    { event: 'notification.failed', notificationId: notification.id, willRetry: false },
    'Notification failed for good',
  )
  await report(tx, notification, 'failed', lastError, deps)
}

function isRecipientRefused(err: unknown): boolean {
  const responseCode =
    typeof err === 'object' && err !== null && 'responseCode' in err ? err.responseCode : null
  return (
    typeof responseCode === 'number' &&
    responseCode >= PERMANENT_FAILURE_MIN &&
    responseCode <= PERMANENT_FAILURE_MAX
  )
}

function errorMessageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

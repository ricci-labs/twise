import type { WorkspaceTransaction } from '@api/core/db/db.types'
import { type AuditName, namesById } from '@api/modules/audit'
import {
  selectChargeContactNames,
  selectContactNames,
} from '@api/modules/contacts/contacts.repository'

export async function readContactNames(
  tx: WorkspaceTransaction,
  contactIds: string[],
): Promise<ReadonlyMap<string, AuditName>> {
  return namesById(contactIds.length === 0 ? [] : await selectContactNames(tx, contactIds))
}

export async function readChargeNames(
  tx: WorkspaceTransaction,
  chargeIds: string[],
): Promise<ReadonlyMap<string, AuditName>> {
  return namesById(chargeIds.length === 0 ? [] : await selectChargeContactNames(tx, chargeIds))
}

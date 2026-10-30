import type { WorkspaceTransaction } from '@api/core/db/db.types'
import { ValidationError } from '@api/core/http/errors'
import { type AuditName, namesById } from '@api/modules/audit'
import { findUsableAccounts, selectAccountNames } from '@api/modules/ledger/ledger.repository'
import type { AccountsById } from '@api/modules/ledger/ledger.types'
import type { AccountRef } from '@financas/shared'

export async function loadAccounts(
  tx: WorkspaceTransaction,
  accountIds: string[],
): Promise<AccountsById> {
  const found = await findUsableAccounts(tx, accountIds)
  return new Map(found.map((account) => [account.id, account]))
}

export function pick(accounts: AccountsById, accountId: string): AccountRef {
  const account = accounts.get(accountId)
  if (!account) {
    throw new ValidationError('ACCOUNT_NOT_AVAILABLE', `Account ${accountId} is not available`)
  }
  return account
}

export async function readAccountNames(
  tx: WorkspaceTransaction,
  accountIds: string[],
): Promise<ReadonlyMap<string, AuditName>> {
  return namesById(accountIds.length === 0 ? [] : await selectAccountNames(tx, accountIds))
}

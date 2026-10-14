import { isMoneyAccountKind } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import type {
  AccountEditorProps,
  AccountFormInput,
  ChangeAccountProps,
  LedgerAccount,
} from '@web/features/accounts/accounts.types'
import { accountsQueryOptions } from '@web/features/accounts/api/accounts.queries'
import { AccountForm } from '@web/features/accounts/components/account-form'
import { useWorkspaceMembers } from '@web/features/accounts/hooks/use-workspace-members'
import { hasPermission } from '@web/lib/permissions'

const NEW_ACCOUNT = 'new'
const FIRST_KIND = 'checking'

export function AccountEditor(props: AccountEditorProps) {
  const { param, permissions } = props
  if (param === NEW_ACCOUNT) {
    return hasPermission(permissions, 'accounts', 'create') ? <NewAccount {...props} /> : null
  }
  if (!param || !hasPermission(permissions, 'accounts', 'update')) {
    return null
  }
  return <ChangeAccount {...props} accountId={param} />
}

function NewAccount({
  workspaceId,
  currentUserId,
  permissions,
  onClose,
  onCreated,
}: AccountEditorProps) {
  const members = useWorkspaceMembers(workspaceId, permissions)
  if (members === undefined) {
    return null
  }
  return (
    <AccountForm
      workspaceId={workspaceId}
      mode={{ kind: 'create' }}
      members={members}
      defaults={blankAccount(members ? currentUserId : '')}
      onClose={onClose}
      onCreated={onCreated}
    />
  )
}

function ChangeAccount({
  workspaceId,
  permissions,
  accountId,
  onClose,
  onCreated,
}: ChangeAccountProps) {
  const members = useWorkspaceMembers(workspaceId, permissions)
  const accounts = useQuery(accountsQueryOptions(workspaceId)).data
  const account = accounts?.find((candidate) => candidate.id === accountId)
  if (members === undefined || !account || account.isSystem || !isMoneyAccountKind(account.kind)) {
    return null
  }
  return (
    <AccountForm
      key={account.id}
      workspaceId={workspaceId}
      mode={{ kind: 'edit', account }}
      members={members}
      defaults={defaultsOf(account, account.kind)}
      onClose={onClose}
      onCreated={onCreated}
    />
  )
}

function blankAccount(ownerUserId: string): AccountFormInput {
  return { kind: FIRST_KIND, name: '', ownerUserId, icon: '', color: '' }
}

function defaultsOf(account: LedgerAccount, kind: AccountFormInput['kind']): AccountFormInput {
  return {
    kind,
    name: account.name,
    ownerUserId: account.ownerUserId ?? '',
    icon: account.icon ?? '',
    color: account.color ?? '',
  }
}

import { Link } from '@tanstack/react-router'
import { ArchivedToggle } from '@web/components/display/archived-toggle'
import { AccountGroup } from '@web/components/finance/account-group'
import { AccountRow } from '@web/components/finance/account-row'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { AccountsListsProps, ListedAccount } from '@web/features/accounts/accounts.types'
import { AccountRowActions } from '@web/features/accounts/components/account-row-actions'
import { hasPermission } from '@web/lib/permissions'

const messages = accountsMessages.groups

export function AccountsLists({
  workspaceId,
  permissions,
  accounts,
  highlightedId,
}: AccountsListsProps) {
  const active = accounts.filter((account) => !account.isArchived)
  const money = active.filter((account) => account.isMoney)
  const cards = active.filter((account) => account.isCard)
  const archived = accounts.filter((account) => account.isArchived)
  const rowOf = (account: ListedAccount) => (
    <AccountRow
      key={account.id}
      name={account.name}
      icon={account.icon}
      color={account.color}
      detail={account.detail}
      amountCents={account.amountCents}
      isArchived={account.isArchived}
      isHighlighted={account.id === highlightedId}
      actions={
        <AccountRowActions workspaceId={workspaceId} permissions={permissions} account={account} />
      }
    />
  )
  return (
    <>
      {money.length > 0 && (
        <AccountGroup
          title={messages.money}
          add={
            hasPermission(permissions, 'accounts', 'create')
              ? {
                  label: messages.newAccount,
                  link: <Link to="." search={(previous) => ({ ...previous, account: 'new' })} />,
                }
              : undefined
          }
        >
          {money.map(rowOf)}
        </AccountGroup>
      )}
      {cards.length > 0 && (
        <AccountGroup title={messages.cards} note={messages.cardsNote}>
          {cards.map(rowOf)}
        </AccountGroup>
      )}
      <ArchivedToggle count={archived.length}>
        <AccountGroup>{archived.map(rowOf)}</AccountGroup>
      </ArchivedToggle>
    </>
  )
}

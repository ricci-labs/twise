import { ArchivedToggle } from '@web/components/display/archived-toggle'
import { Card } from '@web/components/display/card'
import {
  DataTable,
  DataTableAmount,
  type DataTableColumn,
  DataTableName,
} from '@web/components/display/data-table'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { AccountsListsProps, ListedAccount } from '@web/features/accounts/accounts.types'
import { AccountRowActions } from '@web/features/accounts/components/account-row-actions'
import { cardEditActionsOf } from '@web/features/accounts/components/card-edit-actions'
import { accountEntriesLink } from '@web/features/accounts/components/entries-links'
import { hasPermission } from '@web/lib/permissions'

const messages = accountsMessages.groups
const columns = messages.columns

const MONEY_COLUMNS: readonly DataTableColumn[] = [
  { key: 'name', label: columns.account },
  { key: 'kind', label: columns.kind },
  { key: 'owner', label: columns.owner },
  { key: 'balance', label: columns.balance, align: 'end' },
  { key: 'actions', label: columns.actions, isLabelHidden: true, isActions: true },
]

const CARD_COLUMNS: readonly DataTableColumn[] = [
  { key: 'name', label: columns.card },
  { key: 'cycle', label: columns.cycle },
  { key: 'open', label: columns.open, align: 'end' },
  { key: 'actions', label: columns.actions, isLabelHidden: true, isActions: true },
]

export function AccountsTables({ workspaceId, permissions, accounts }: AccountsListsProps) {
  const active = accounts.filter((account) => !account.isArchived)
  const money = active.filter((account) => account.isMoney)
  const cards = active.filter((account) => account.isCard)
  const archived = accounts.filter((account) => account.isArchived)
  const canSeeEntries = hasPermission(permissions, 'entries', 'view')
  const entriesLinkOf = (account: ListedAccount) =>
    canSeeEntries ? accountEntriesLink(workspaceId, account.id) : undefined
  const actionsOf = (account: ListedAccount) => (
    <AccountRowActions
      key="actions"
      workspaceId={workspaceId}
      permissions={permissions}
      account={account}
      leadingActions={
        account.isCard && !account.isArchived ? cardEditActionsOf(permissions, account.id) : []
      }
    />
  )
  const moneyRow = (account: ListedAccount) => ({
    key: account.id,
    cells: [
      <DataTableName
        key="name"
        name={account.name}
        icon={account.icon}
        color={account.color}
        link={entriesLinkOf(account)}
      />,
      account.kindLabel,
      account.ownerLabel,
      <DataTableAmount key="balance" cents={account.amountCents} />,
      actionsOf(account),
    ],
  })
  return (
    <div className="flex flex-col gap-5">
      {money.length > 0 && (
        <Card title={messages.money} description={messages.moneyDescription}>
          <DataTable
            label={messages.money}
            layout="accounts"
            columns={MONEY_COLUMNS}
            rows={money.map(moneyRow)}
          />
        </Card>
      )}
      {cards.length > 0 && (
        <Card title={messages.cards} description={messages.cardsDescription}>
          <DataTable
            label={messages.cards}
            layout="cards"
            columns={CARD_COLUMNS}
            rows={cards.map((account) => ({
              key: account.id,
              cells: [
                <DataTableName
                  key="name"
                  name={account.name}
                  icon={account.icon}
                  color={account.color}
                  link={entriesLinkOf(account)}
                />,
                account.kindLabel,
                <DataTableAmount key="open" cents={account.amountCents} />,
                actionsOf(account),
              ],
            }))}
          />
        </Card>
      )}
      <ArchivedToggle count={archived.length}>
        <Card title={accountsMessages.archivedTitle}>
          <DataTable
            label={accountsMessages.archivedTitle}
            layout="accounts"
            columns={MONEY_COLUMNS}
            rows={archived.map(moneyRow)}
          />
        </Card>
      </ArchivedToggle>
    </div>
  )
}

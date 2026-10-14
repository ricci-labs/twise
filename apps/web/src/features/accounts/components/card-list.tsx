import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import type { ItemAction } from '@web/components/actions/item-actions'
import { ArchivedToggle } from '@web/components/display/archived-toggle'
import { AccountGroup } from '@web/components/finance/account-group'
import { AccountRow } from '@web/components/finance/account-row'
import { CardBlock } from '@web/components/finance/card-block'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  CardItemProps,
  CardListProps,
  CardSummary,
  WorkspaceMember,
} from '@web/features/accounts/accounts.types'
import { AccountRowActions } from '@web/features/accounts/components/account-row-actions'
import { listedCardOf } from '@web/features/accounts/components/listed-accounts'
import { formatShortDate } from '@web/lib/format/calendar'
import { hasPermission } from '@web/lib/permissions'

const messages = accountsMessages.cardsPage

const CARD_ICON = 'card'

export function CardList({ workspaceId, permissions, cards, members }: CardListProps) {
  const active = cards.filter((card) => card.archivedAt === null)
  const archived = cards.filter((card) => card.archivedAt !== null)
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {active.map((card) => (
          <CardItem
            key={card.accountId}
            workspaceId={workspaceId}
            permissions={permissions}
            card={card}
            holder={holderOf(card, members)}
          />
        ))}
      </div>
      <ArchivedToggle count={archived.length}>
        <AccountGroup>
          {archived.map((card) => (
            <AccountRow
              key={card.accountId}
              name={card.name}
              icon={card.icon ?? CARD_ICON}
              color={card.color}
              detail={messages.cycle(card.closingDay, card.dueDay)}
              amountCents={card.openCents}
              isArchived
              actions={
                <AccountRowActions
                  workspaceId={workspaceId}
                  permissions={permissions}
                  account={listedCardOf(card)}
                />
              }
            />
          ))}
        </AccountGroup>
      </ArchivedToggle>
    </>
  )
}

function CardItem({ workspaceId, permissions, card, holder }: CardItemProps) {
  const cycle = messages.cycle(card.closingDay, card.dueDay)
  const invoices = (
    <Link to="/w/$workspaceId/cards/$card" params={{ workspaceId, card: card.accountId }} />
  )
  const openInvoice = (
    <Link
      to="/w/$workspaceId/cards/$card"
      params={{ workspaceId, card: card.accountId }}
      search={{ month: card.currentInvoice.referenceMonth }}
    />
  )
  return (
    <CardBlock
      name={card.name}
      icon={card.icon ?? CARD_ICON}
      color={card.color}
      cycle={holder ? messages.withHolder(cycle, holder) : cycle}
      link={invoices}
      invoice={{
        label: messages.openInvoice,
        amountCents: card.currentInvoice.totalCents,
        due: messages.due(formatShortDate(card.currentInvoice.dueOn)),
        link: openInvoice,
      }}
      limit={limitOf(card)}
      open={messages.open(formatBrl(card.openCents))}
      bestDay={{ label: messages.bestDay, value: messages.day(card.closingDay) }}
      actions={
        <AccountRowActions
          workspaceId={workspaceId}
          permissions={permissions}
          account={listedCardOf(card)}
          leadingActions={invoiceActionsFor(permissions, invoices)}
        />
      }
    />
  )
}

function invoiceActionsFor(
  permissions: CardItemProps['permissions'],
  invoices: NonNullable<ItemAction['render']>,
): ItemAction[] {
  const canManage =
    hasPermission(permissions, 'accounts', 'update') ||
    hasPermission(permissions, 'accounts', 'delete')
  return canManage
    ? [{ key: 'invoices', label: messages.invoices, icon: 'list', render: invoices }]
    : []
}

function limitOf(card: CardSummary) {
  if (card.limitCents === null || card.limitUsedPercent === null) {
    return undefined
  }
  return {
    label: messages.limit(formatBrl(card.limitCents)),
    used: messages.used(card.limitUsedPercent),
    percent: card.limitUsedPercent,
  }
}

function holderOf(card: CardSummary, members: readonly WorkspaceMember[] | null): string | null {
  return members?.find((member) => member.userId === card.holderUserId)?.displayName ?? null
}

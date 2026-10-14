import { isMoneyAccountKind } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import type {
  CardEditorProps,
  CardFormInput,
  CardSummary,
  ChangeCardProps,
  LedgerAccount,
} from '@web/features/accounts/accounts.types'
import {
  accountsQueryOptions,
  cardsQueryOptions,
} from '@web/features/accounts/api/accounts.queries'
import { CardForm } from '@web/features/accounts/components/card-form'
import { useWorkspaceMembers } from '@web/features/accounts/hooks/use-workspace-members'
import { formatTypedAmount } from '@web/lib/format/money'
import { hasPermission } from '@web/lib/permissions'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'

const NEW_CARD = 'new'

const DEFAULT_CARD_COLOR = ACCOUNT_COLORS.find((color) => color.key === 'grey')?.value ?? ''

export function CardEditor(props: CardEditorProps) {
  const { param, permissions } = props
  if (param === NEW_CARD) {
    return hasPermission(permissions, 'cards', 'create') ? <NewCard {...props} /> : null
  }
  const canRename = hasPermission(permissions, 'accounts', 'update')
  const canChangeCycle = hasPermission(permissions, 'cards', 'update')
  if (!param || !(canRename || canChangeCycle)) {
    return null
  }
  return (
    <ChangeCard {...props} cardId={param} canRename={canRename} canChangeCycle={canChangeCycle} />
  )
}

function NewCard({ workspaceId, currentUserId, permissions, onClose, onCreated }: CardEditorProps) {
  const members = useWorkspaceMembers(workspaceId, permissions)
  const accounts = useQuery(accountsQueryOptions(workspaceId)).data
  if (members === undefined || !accounts) {
    return null
  }
  return (
    <CardForm
      workspaceId={workspaceId}
      mode={{ kind: 'create' }}
      accounts={accounts}
      members={members}
      defaults={blankCard(members ? currentUserId : '', firstPayingAccountOf(accounts))}
      canRename
      canChangeCycle
      onClose={onClose}
      onCreated={onCreated}
    />
  )
}

function ChangeCard({
  workspaceId,
  permissions,
  part,
  cardId,
  canRename,
  canChangeCycle,
  onClose,
  onCreated,
}: ChangeCardProps) {
  const members = useWorkspaceMembers(workspaceId, permissions)
  const accounts = useQuery(accountsQueryOptions(workspaceId)).data
  const card = useQuery(cardsQueryOptions(workspaceId)).data?.find(
    (candidate) => candidate.accountId === cardId,
  )
  if (members === undefined || !accounts || !card) {
    return null
  }
  return (
    <CardForm
      key={card.accountId}
      workspaceId={workspaceId}
      mode={{ kind: 'edit', card, part }}
      accounts={accounts}
      members={members}
      defaults={defaultsOf(card)}
      canRename={canRename}
      canChangeCycle={canChangeCycle}
      onClose={onClose}
      onCreated={onCreated}
    />
  )
}

function blankCard(holderUserId: string, paymentAccountId: string): CardFormInput {
  return {
    name: '',
    closingDay: '',
    dueDay: '',
    purchaseOnClosingDayGoesNext: true,
    limit: '',
    paymentAccountId,
    holderUserId,
    color: DEFAULT_CARD_COLOR,
  }
}

function defaultsOf(card: CardSummary): CardFormInput {
  return {
    name: card.name,
    closingDay: String(card.closingDay),
    dueDay: String(card.dueDay),
    purchaseOnClosingDayGoesNext: card.purchaseOnClosingDayGoesNext,
    limit: card.limitCents === null ? '' : formatTypedAmount(card.limitCents),
    paymentAccountId: card.paymentAccountId ?? '',
    holderUserId: card.holderUserId ?? '',
    color: card.color ?? '',
  }
}

function firstPayingAccountOf(accounts: readonly LedgerAccount[]): string {
  const paying = accounts.find(
    (account) =>
      !account.isSystem && account.archivedAt === null && isMoneyAccountKind(account.kind),
  )
  return paying?.id ?? ''
}

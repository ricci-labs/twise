import { SubPageHeader } from '@web/components/layout/sub-page-header'
import type { CardPageHeaderProps } from '@web/features/accounts/accounts.types'
import { AccountRowActions } from '@web/features/accounts/components/account-row-actions'
import { cardEditActionsOf } from '@web/features/accounts/components/card-edit-actions'
import { listedCardOf } from '@web/features/accounts/components/listed-accounts'

export function CardPageHeader({
  workspaceId,
  permissions,
  card,
  back,
  backLabel,
  title,
  description,
}: CardPageHeaderProps) {
  return (
    <SubPageHeader
      back={back}
      backLabel={backLabel}
      title={title}
      description={description}
      actions={
        <AccountRowActions
          workspaceId={workspaceId}
          permissions={permissions}
          account={listedCardOf(card)}
          leadingActions={cardEditActionsOf(permissions, card.accountId)}
        />
      }
    />
  )
}

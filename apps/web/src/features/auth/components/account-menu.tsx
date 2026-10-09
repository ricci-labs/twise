import { ActionMenu } from '@web/components/actions/action-menu'
import { Avatar } from '@web/components/display/avatar'
import { useLogOut } from '@web/features/auth/api/use-log-out'
import { useSignedInAccount } from '@web/features/auth/api/use-signed-in-account'
import { authMessages } from '@web/features/auth/auth.messages'
import type { AccountLinkProps } from '@web/features/auth/auth.types'
import { ChevronDown } from 'lucide-react'

const messages = authMessages.accountMenu

export function AccountMenu({ accountLink }: AccountLinkProps) {
  const account = useSignedInAccount()
  const logOut = useLogOut()
  if (!account) {
    return null
  }
  return (
    <ActionMenu
      side="top"
      trigger={
        <button
          type="button"
          aria-label={messages.label(account.displayName)}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-sunken"
        >
          <Avatar name={account.displayName} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-label">{account.displayName}</span>
            <span className="truncate text-caption text-ink-muted">{account.email}</span>
          </span>
          <ChevronDown className="size-4 text-ink-muted" aria-hidden="true" />
        </button>
      }
      groups={[
        [{ key: 'account', label: messages.myAccount, icon: 'user', render: accountLink }],
        [
          {
            key: 'log-out',
            label: authMessages.logOut,
            icon: 'out',
            onSelect: () => logOut.mutate(),
          },
        ],
      ]}
    />
  )
}

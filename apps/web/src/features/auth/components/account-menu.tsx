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
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md pl-2 text-left hover:bg-sunken group-data-collapsed/sidebar:w-auto group-data-collapsed/sidebar:rounded-full group-data-collapsed/sidebar:pl-0"
        >
          <Avatar name={account.displayName} />
          <span className="flex min-w-0 flex-1 flex-col group-data-collapsed/sidebar:sr-only">
            <span className="sr-only">{messages.label}</span>{' '}
            <span className="truncate text-account-name">{account.displayName}</span>{' '}
            <span className="truncate text-caption text-ink-muted">{account.email}</span>
          </span>
          <span className="grid size-touch shrink-0 place-items-center text-ink-muted group-data-collapsed/sidebar:hidden">
            <ChevronDown className="size-4" aria-hidden="true" />
          </span>
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

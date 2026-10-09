import { NavLink } from '@web/components/navigation/nav-link'
import { useLogOut } from '@web/features/auth/api/use-log-out'
import { authMessages } from '@web/features/auth/auth.messages'
import type { AccountLinkProps } from '@web/features/auth/auth.types'

export function AccountActions({ accountLink }: AccountLinkProps) {
  const logOut = useLogOut()
  return (
    <ul className="flex flex-col gap-0.5 border-t border-border pt-2">
      <li className="flex flex-col">
        <NavLink
          item={{
            key: 'account',
            label: authMessages.accountMenu.myAccount,
            icon: 'user',
            render: accountLink,
          }}
        />
      </li>
      <li className="flex flex-col">
        <NavLink
          item={{
            key: 'log-out',
            label: authMessages.logOut,
            icon: 'out',
            render: <button type="button" onClick={() => logOut.mutate()} />,
          }}
        />
      </li>
    </ul>
  )
}

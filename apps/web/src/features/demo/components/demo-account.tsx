import { Link } from '@tanstack/react-router'
import { ActionMenu } from '@web/components/actions/action-menu'
import { Avatar } from '@web/components/display/avatar'
import { NavLink } from '@web/components/navigation/nav-link'
import { demoMessages as messages } from '@web/features/demo/demo.messages'
import { ChevronDown } from 'lucide-react'

export function DemoAccountMenu() {
  return (
    <ActionMenu
      side="top"
      trigger={
        <button
          type="button"
          aria-label={messages.accountLabel}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-sunken"
        >
          <Avatar name={messages.displayName} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-label">{messages.displayName}</span>
            <span className="truncate text-caption text-ink-muted">{messages.email}</span>
          </span>
          <ChevronDown className="size-4 text-ink-muted" aria-hidden="true" />
        </button>
      }
      groups={[
        [
          { key: 'sign-up', label: messages.signUp, icon: 'user', render: <Link to="/signup" /> },
          { key: 'log-in', label: messages.logIn, icon: 'out', render: <Link to="/login" /> },
        ],
      ]}
    />
  )
}

export function DemoAccountActions() {
  return (
    <ul className="flex flex-col gap-0.5 border-t border-border pt-2">
      <li className="flex flex-col">
        <NavLink
          item={{
            key: 'sign-up',
            label: messages.signUp,
            icon: 'user',
            render: <Link to="/signup" />,
          }}
        />
      </li>
      <li className="flex flex-col">
        <NavLink
          item={{ key: 'log-in', label: messages.logIn, icon: 'out', render: <Link to="/login" /> }}
        />
      </li>
    </ul>
  )
}

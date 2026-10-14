import { Link, useNavigate } from '@tanstack/react-router'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { AccountsAreaHeaderProps } from '@web/features/accounts/accounts.types'

const messages = accountsMessages

export function AccountsAreaHeader({ workspaceId, current, canSeeTrash }: AccountsAreaHeaderProps) {
  const navigate = useNavigate()
  return (
    <header className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-form-title-lg">{messages.title}</h1>
        {canSeeTrash && (
          <Link
            to="/w/$workspaceId/$area"
            params={{ workspaceId, area: 'trash' }}
            aria-label={messages.trash}
            className="grid size-touch place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <TwiseIcon name="trash" size="sm" />
          </Link>
        )}
      </div>
      <SegmentedControl
        label={messages.tabs.label}
        value={current}
        options={[
          { value: 'accounts', label: messages.tabs.accounts },
          { value: 'categories', label: messages.tabs.categories },
        ]}
        width="full"
        onValueChange={(area) =>
          navigate({ to: '/w/$workspaceId/$area', params: { workspaceId, area } })
        }
      />
    </header>
  )
}

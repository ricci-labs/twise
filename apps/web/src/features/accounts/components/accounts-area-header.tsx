import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { PageHeader } from '@web/components/layout/page-header'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { AccountsAreaHeaderProps } from '@web/features/accounts/accounts.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { Plus } from 'lucide-react'

const messages = accountsMessages

export function AccountsAreaHeader({
  workspaceId,
  current,
  canSeeTrash,
  newItem,
}: AccountsAreaHeaderProps) {
  const navigate = useNavigate()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const trash = <Link to="/w/$workspaceId/accounts/trash" params={{ workspaceId }} />
  return (
    <div className="flex flex-col gap-3.5 lg:gap-4.5">
      <PageHeader
        title={messages.title}
        description={messages.description}
        actions={
          isDesktop ? (
            <>
              {canSeeTrash && current === 'accounts' && (
                <Button variant="quiet" render={trash}>
                  <TwiseIcon name="trash" size="md" />
                  {messages.trashButton}
                </Button>
              )}
              {newItem && (
                <Button render={newItem.link}>
                  <Plus aria-hidden="true" />
                  {newItem.label}
                </Button>
              )}
            </>
          ) : (
            canSeeTrash && (
              <Link
                to="/w/$workspaceId/accounts/trash"
                params={{ workspaceId }}
                aria-label={messages.trash}
                className="grid size-touch place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <TwiseIcon name="trash" size="sm" />
              </Link>
            )
          )
        }
      />
      <SegmentedControl
        label={messages.tabs.label}
        value={current}
        options={[
          { value: 'accounts', label: messages.tabs.accounts },
          { value: 'categories', label: messages.tabs.categories },
        ]}
        width="full"
        className="lg:w-90"
        onValueChange={(area) =>
          navigate({
            to: area === 'accounts' ? '/w/$workspaceId/accounts' : '/w/$workspaceId/categories',
            params: { workspaceId },
          })
        }
      />
    </div>
  )
}

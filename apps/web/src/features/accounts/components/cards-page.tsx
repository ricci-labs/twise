import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { CardsPageProps } from '@web/features/accounts/accounts.types'
import { cardsQueryOptions, membersQueryOptions } from '@web/features/accounts/api/accounts.queries'
import { CardList } from '@web/features/accounts/components/card-list'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { hasPermission } from '@web/lib/permissions'
import { Plus } from 'lucide-react'

const messages = accountsMessages.cardsPage

const LOADING_CARDS = ['first', 'second'] as const

export function CardsPage({ workspaceId, permissions }: CardsPageProps) {
  usePageTitle(messages.pageTitle)
  const canCreate = hasPermission(permissions, 'cards', 'create')
  return (
    <div className="mx-auto flex w-full max-w-240 flex-col gap-4 px-4 pt-2 pb-6 lg:px-8 lg:pt-7 lg:pb-12">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-display text-form-title-lg">{messages.title}</h1>
        {canCreate && (
          <Button
            variant="secondary"
            size="sm"
            render={<Link to="." search={(previous) => ({ ...previous, card: 'new' })} />}
          >
            <Plus aria-hidden="true" />
            {messages.newCard}
          </Button>
        )}
      </header>
      <CardsBody workspaceId={workspaceId} permissions={permissions} />
    </div>
  )
}

function CardsBody({ workspaceId, permissions }: CardsPageProps) {
  const cards = useQuery(cardsQueryOptions(workspaceId))
  const members = useQuery({
    ...membersQueryOptions(workspaceId),
    enabled: hasPermission(permissions, 'members', 'view'),
  })

  if (cards.isError) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={cards.error instanceof ApiError ? cards.error.ref : null}
        isRetrying={cards.isFetching}
        onRetry={() => void cards.refetch()}
      />
    )
  }
  if (!cards.data) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {LOADING_CARDS.map((key) => (
          <SectionSkeleton key={key} lines={4} />
        ))}
      </div>
    )
  }
  if (cards.data.length === 0) {
    return (
      <EmptyBlock
        icon="card"
        title={messages.empty.title}
        text={messages.empty.text}
        action={
          hasPermission(permissions, 'cards', 'create') && (
            <Button render={<Link to="." search={(previous) => ({ ...previous, card: 'new' })} />}>
              <Plus aria-hidden="true" />
              {messages.newCard}
            </Button>
          )
        }
      />
    )
  }
  return (
    <CardList
      workspaceId={workspaceId}
      permissions={permissions}
      cards={cards.data}
      members={members.data ?? null}
    />
  )
}

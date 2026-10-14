import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { PageHeader } from '@web/components/layout/page-header'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { CardsBodyProps, CardsPageProps } from '@web/features/accounts/accounts.types'
import { cardsQueryOptions, membersQueryOptions } from '@web/features/accounts/api/accounts.queries'
import { CardList } from '@web/features/accounts/components/card-list'
import { UpcomingInvoices } from '@web/features/accounts/components/upcoming-invoices'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'
import { Plus } from 'lucide-react'

const messages = accountsMessages.cardsPage

const LOADING_CARDS = ['first', 'second'] as const

export function CardsPage({ workspaceId, permissions }: CardsPageProps) {
  usePageTitle(messages.pageTitle)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const canCreate = hasPermission(permissions, 'cards', 'create')
  return (
    <div className="mx-auto flex w-full max-w-240 flex-col gap-4 px-4 pt-2 pb-6 lg:max-w-296 lg:gap-5 lg:px-8 lg:pt-7 lg:pb-12">
      <PageHeader
        title={messages.title}
        description={messages.description}
        actions={
          canCreate && (
            <Button
              variant={isDesktop ? 'primary' : 'secondary'}
              size={isDesktop ? 'md' : 'sm'}
              render={<Link to="." search={(previous) => ({ ...previous, card: 'new' })} />}
            >
              <Plus aria-hidden="true" />
              {messages.newCard}
            </Button>
          )
        }
      />
      <CardsBody workspaceId={workspaceId} permissions={permissions} isDesktop={isDesktop} />
    </div>
  )
}

function CardsBody({ workspaceId, permissions, isDesktop }: CardsBodyProps) {
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
      afterCards={isDesktop && <UpcomingInvoices workspaceId={workspaceId} cards={cards.data} />}
    />
  )
}

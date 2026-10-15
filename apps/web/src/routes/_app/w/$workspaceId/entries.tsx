import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type EntriesListSearch, EntriesPage, entriesListSearchSchema } from '@web/features/entries'
import { useCallback } from 'react'

export const Route = createFileRoute('/_app/w/$workspaceId/entries')({
  validateSearch: entriesListSearchSchema,
  component: function EntriesRoute() {
    const { workspaceId } = Route.useParams()
    const search = Route.useSearch()
    const { account, access } = Route.useRouteContext()
    const navigate = useNavigate()
    const changeSearch = useCallback(
      (change: Partial<EntriesListSearch>) =>
        navigate({ to: '.', search: (previous) => ({ ...previous, ...change }), replace: true }),
      [navigate],
    )
    return (
      <EntriesPage
        workspaceId={workspaceId}
        permissions={access.permissions}
        currentUserId={account.userId}
        memberDirectory={access.memberDirectory}
        search={search}
        onSearchChange={changeSearch}
      />
    )
  },
})

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { HistoryPage, type HistorySearch, historySearchSchema } from '@web/features/audit'
import { useCallback } from 'react'

export const Route = createFileRoute('/_app/w/$workspaceId/history')({
  validateSearch: historySearchSchema,
  component: function HistoryRoute() {
    const { workspaceId } = Route.useParams()
    const search = Route.useSearch()
    const { access } = Route.useRouteContext()
    const navigate = useNavigate()
    const changeSearch = useCallback(
      (change: Partial<HistorySearch>) =>
        navigate({ to: '.', search: (previous) => ({ ...previous, ...change }), replace: true }),
      [navigate],
    )
    return (
      <HistoryPage
        workspaceId={workspaceId}
        workspaceName={access.workspace.name}
        memberDirectory={access.memberDirectory}
        search={search}
        onSearchChange={changeSearch}
      />
    )
  },
})

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AccountsPage, accountsPageSearchSchema } from '@web/features/accounts'
import { useCallback } from 'react'

export const Route = createFileRoute('/_app/w/$workspaceId/accounts')({
  validateSearch: accountsPageSearchSchema,
  component: function AccountsRoute() {
    const { workspaceId } = Route.useParams()
    const { created } = Route.useSearch()
    const { access } = Route.useRouteContext()
    const navigate = useNavigate()
    const forgetCreated = useCallback(
      () =>
        navigate({
          to: '.',
          search: (previous) => ({ ...previous, created: undefined }),
          replace: true,
        }),
      [navigate],
    )
    return (
      <AccountsPage
        workspaceId={workspaceId}
        permissions={access.permissions}
        createdId={created}
        onCreatedSeen={forgetCreated}
      />
    )
  },
})

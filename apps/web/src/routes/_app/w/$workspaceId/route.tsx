import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { AccountEditor, accountSearchSchema } from '@web/features/accounts'
import { AccountActions, AccountMenu } from '@web/features/auth'
import { NewEntry, newEntrySearchSchema } from '@web/features/entries'
import { openWorkspace, WorkspaceShell } from '@web/features/workspaces'

export const Route = createFileRoute('/_app/w/$workspaceId')({
  validateSearch: newEntrySearchSchema.extend(accountSearchSchema.shape),
  beforeLoad: ({ context, params }) => openWorkspace(context.queryClient, params.workspaceId),
  component: function WorkspaceRoute() {
    const { workspaceId } = Route.useParams()
    const { entry, account: accountParam } = Route.useSearch()
    const { account, access } = Route.useRouteContext()
    const navigate = useNavigate()
    const accountLink = (
      <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'account' }} />
    )
    const closeAccountForm = () =>
      navigate({ to: '.', search: (previous) => ({ ...previous, account: undefined }) })
    return (
      <WorkspaceShell
        workspaceId={workspaceId}
        accountMenu={<AccountMenu accountLink={accountLink} />}
        accountActions={<AccountActions accountLink={accountLink} />}
      >
        <Outlet />
        <NewEntry
          workspaceId={workspaceId}
          currentUserId={account.userId}
          permissions={access.permissions}
          isOpen={entry === 'new'}
          onClose={() =>
            navigate({ to: '.', search: (previous) => ({ ...previous, entry: undefined }) })
          }
        />
        <AccountEditor
          workspaceId={workspaceId}
          currentUserId={account.userId}
          permissions={access.permissions}
          param={accountParam}
          onClose={closeAccountForm}
          onCreated={(accountId) => {
            if (entry === 'new') {
              closeAccountForm()
              return
            }
            navigate({
              to: '/w/$workspaceId/accounts',
              params: { workspaceId },
              search: { created: accountId },
            })
          }}
        />
      </WorkspaceShell>
    )
  },
})

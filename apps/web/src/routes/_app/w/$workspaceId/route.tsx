import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { AccountActions, AccountMenu } from '@web/features/auth'
import { openWorkspace, WorkspaceShell } from '@web/features/workspaces'

export const Route = createFileRoute('/_app/w/$workspaceId')({
  beforeLoad: ({ context, params }) => openWorkspace(context.queryClient, params.workspaceId),
  component: function WorkspaceRoute() {
    const { workspaceId } = Route.useParams()
    const accountLink = (
      <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'account' }} />
    )
    return (
      <WorkspaceShell
        workspaceId={workspaceId}
        accountMenu={<AccountMenu accountLink={accountLink} />}
        accountActions={<AccountActions accountLink={accountLink} />}
      >
        <Outlet />
      </WorkspaceShell>
    )
  },
})

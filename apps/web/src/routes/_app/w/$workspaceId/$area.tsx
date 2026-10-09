import { createFileRoute } from '@tanstack/react-router'
import { ComingSoonPage } from '@web/features/workspaces'

export const Route = createFileRoute('/_app/w/$workspaceId/$area')({
  component: function AreaRoute() {
    const { workspaceId } = Route.useParams()
    return <ComingSoonPage workspaceId={workspaceId} />
  },
})

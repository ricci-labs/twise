import { createFileRoute } from '@tanstack/react-router'
import { contactDetailSearchSchema } from '@web/features/contacts'
import { ComingSoonPage } from '@web/features/workspaces'

export const Route = createFileRoute('/_app/w/$workspaceId/contacts_/$contact')({
  validateSearch: contactDetailSearchSchema,
  component: function ContactRoute() {
    const { workspaceId } = Route.useParams()
    return <ComingSoonPage workspaceId={workspaceId} />
  },
})

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ContactDetailPage, contactDetailSearchSchema } from '@web/features/contacts'

export const Route = createFileRoute('/_app/w/$workspaceId/contacts_/$contact')({
  validateSearch: contactDetailSearchSchema,
  component: function ContactRoute() {
    const { workspaceId, contact } = Route.useParams()
    const { access } = Route.useRouteContext()
    const navigate = useNavigate()
    return (
      <ContactDetailPage
        key={contact}
        workspaceId={workspaceId}
        contactId={contact}
        permissions={access.permissions}
        onNewCharge={() =>
          void navigate({ to: '.', search: (previous) => ({ ...previous, charge: 'new' }) })
        }
      />
    )
  },
})

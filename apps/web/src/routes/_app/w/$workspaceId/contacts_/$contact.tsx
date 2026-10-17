import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ContactDetailPage, contactDetailSearchSchema } from '@web/features/contacts'

export const Route = createFileRoute('/_app/w/$workspaceId/contacts_/$contact')({
  validateSearch: contactDetailSearchSchema,
  component: function ContactRoute() {
    const { workspaceId, contact } = Route.useParams()
    const { access, account } = Route.useRouteContext()
    const { charge } = Route.useSearch()
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
        charge={charge}
        currentUser={{
          name: account.displayName,
          email: account.email,
          workspaceName: access.workspace.name,
        }}
        onChargeOpen={(chargeId) =>
          void navigate({ to: '.', search: (previous) => ({ ...previous, charge: chargeId }) })
        }
        onChargeClose={() =>
          void navigate({ to: '.', search: (previous) => ({ ...previous, charge: undefined }) })
        }
        onDeleted={() =>
          void navigate({ to: '/w/$workspaceId/contacts', params: { workspaceId }, replace: true })
        }
      />
    )
  },
})

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ContactsPage, contactsSearchSchema } from '@web/features/contacts'

const DEFAULT_SORT = 'overdue'

export const Route = createFileRoute('/_app/w/$workspaceId/contacts')({
  validateSearch: contactsSearchSchema,
  component: function ContactsRoute() {
    const { workspaceId } = Route.useParams()
    const { sort } = Route.useSearch()
    const { access } = Route.useRouteContext()
    const navigate = useNavigate()
    return (
      <ContactsPage
        workspaceId={workspaceId}
        permissions={access.permissions}
        sort={sort ?? DEFAULT_SORT}
        onSortChange={(next) =>
          void navigate({
            to: '.',
            search: (previous) => ({ ...previous, sort: next === DEFAULT_SORT ? undefined : next }),
            replace: true,
          })
        }
        onCharge={(contactId) =>
          void navigate({
            to: '/w/$workspaceId/contacts/$contact',
            params: { workspaceId, contact: contactId },
            search: { charge: 'new' },
          })
        }
      />
    )
  },
})

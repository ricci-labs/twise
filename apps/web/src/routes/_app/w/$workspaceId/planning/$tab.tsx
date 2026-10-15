import { createFileRoute, notFound } from '@tanstack/react-router'
import { PlanningPage, planningSearchSchema, planningTabSchema } from '@web/features/planning'

export const Route = createFileRoute('/_app/w/$workspaceId/planning/$tab')({
  validateSearch: planningSearchSchema,
  params: {
    parse: ({ tab }) => {
      const parsed = planningTabSchema.safeParse(tab)
      if (!parsed.success) {
        throw notFound()
      }
      return { tab: parsed.data }
    },
    stringify: ({ tab }) => ({ tab }),
  },
  component: function PlanningRoute() {
    const { workspaceId, tab } = Route.useParams()
    const search = Route.useSearch()
    const { access } = Route.useRouteContext()
    return (
      <PlanningPage
        workspaceId={workspaceId}
        tab={tab}
        search={search}
        permissions={access.permissions}
        memberDirectory={access.memberDirectory}
      />
    )
  },
})

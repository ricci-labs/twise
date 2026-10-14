import { createFileRoute } from '@tanstack/react-router'
import { CategoriesPage, categoriesSearchSchema } from '@web/features/accounts'

export const Route = createFileRoute('/_app/w/$workspaceId/categories')({
  validateSearch: categoriesSearchSchema,
  component: function CategoriesRoute() {
    const { workspaceId } = Route.useParams()
    const { kind = 'expense' } = Route.useSearch()
    const { access } = Route.useRouteContext()
    return <CategoriesPage workspaceId={workspaceId} permissions={access.permissions} kind={kind} />
  },
})

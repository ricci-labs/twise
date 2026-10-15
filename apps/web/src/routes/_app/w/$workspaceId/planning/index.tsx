import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/w/$workspaceId/planning/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/w/$workspaceId/planning/$tab',
      params: { workspaceId: params.workspaceId, tab: 'occurrences' },
      replace: true,
    })
  },
})

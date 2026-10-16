import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/w/$workspaceId/planning/holidays')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/w/$workspaceId/settings/holidays',
      params: { workspaceId: params.workspaceId },
      replace: true,
    })
  },
})

import { createFileRoute, Outlet } from '@tanstack/react-router'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { AuthFrame } from '@web/components/layout/auth-layout'

export const Route = createFileRoute('/_auth')({
  component: function AuthRoute() {
    return (
      <AuthFrame banner={<OfflineBanner />}>
        <Outlet />
      </AuthFrame>
    )
  },
})

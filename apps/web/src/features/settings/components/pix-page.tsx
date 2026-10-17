import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import { Breadcrumb } from '@web/components/navigation/breadcrumb'
import { workspaceSettingsQueryOptions } from '@web/features/settings/api/settings.queries'
import { PixSettingsForm } from '@web/features/settings/components/pix-settings-form'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type { PixContentProps, PixPageProps } from '@web/features/settings/settings.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'

const messages = settingsMessages.pix
const SKELETON_LINES = 6

export function PixPage({ workspaceId, workspaceName, permissions }: PixPageProps) {
  usePageTitle(messages.pageTitle)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const settingsLink = <Link to="/w/$workspaceId/settings" params={{ workspaceId }} />
  const canUpdate = hasPermission(permissions, 'settings', 'update')
  if (isDesktop) {
    return (
      <PageFrame>
        <div className="mb-2">
          <Breadcrumb
            label={messages.crumb}
            items={[
              { label: settingsMessages.title, link: settingsLink },
              { label: messages.title },
            ]}
          />
        </div>
        <PageHeader title={messages.title} description={messages.lead(workspaceName)} />
        <div className="mt-5 max-w-160">
          <PixContent workspaceId={workspaceId} canUpdate={canUpdate} lead={null} />
        </div>
      </PageFrame>
    )
  }
  return (
    <PageFrame edge="bleed" className="gap-3">
      <SubPageHeader back={settingsLink} backLabel={messages.back} title={messages.title} />
      <div className="px-4">
        <PixContent
          workspaceId={workspaceId}
          canUpdate={canUpdate}
          lead={messages.lead(workspaceName)}
        />
      </div>
    </PageFrame>
  )
}

function PixContent({ workspaceId, canUpdate, lead }: PixContentProps) {
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId))
  if (settings.isError) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={settings.error instanceof ApiError ? settings.error.ref : null}
        isRetrying={settings.isFetching}
        onRetry={() => void settings.refetch()}
      />
    )
  }
  if (!settings.data) {
    return <SectionSkeleton lines={SKELETON_LINES} />
  }
  return (
    <PixSettingsForm
      workspaceId={workspaceId}
      settings={settings.data}
      canUpdate={canUpdate}
      lead={lead}
    />
  )
}

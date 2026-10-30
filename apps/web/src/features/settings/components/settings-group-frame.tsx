import { Link } from '@tanstack/react-router'
import { Card } from '@web/components/display/card'
import { Alert } from '@web/components/feedback/alert'
import { SubmitButton } from '@web/components/forms/submit-button'
import { SettingsFormPage } from '@web/components/layout/settings-form-page'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type { SettingsGroupFrameProps } from '@web/features/settings/settings.types'

export function SettingsGroupFrame({
  layout,
  workspaceId,
  title,
  description,
  readOnlyNote,
  saveLabel,
  children,
}: SettingsGroupFrameProps) {
  if (layout === 'card') {
    return (
      <Card
        title={title}
        description={description}
        footerAction={
          !readOnlyNote && (
            <span className="ml-auto">
              <SubmitButton requiresChange loadingLabel={settingsMessages.saving}>
                {saveLabel}
              </SubmitButton>
            </span>
          )
        }
      >
        <div className="flex flex-col gap-5">
          {readOnlyNote && (
            <Alert tone="neutral" icon="lock">
              {readOnlyNote}
            </Alert>
          )}
          {children}
        </div>
      </Card>
    )
  }
  return (
    <SettingsFormPage
      back={<Link to="/w/$workspaceId/settings" params={{ workspaceId }} />}
      backLabel={settingsMessages.back}
      title={title}
      readOnlyNote={readOnlyNote}
      footer={
        <SubmitButton requiresChange loadingLabel={settingsMessages.saving} width="full">
          {saveLabel}
        </SubmitButton>
      }
    >
      {children}
    </SettingsFormPage>
  )
}

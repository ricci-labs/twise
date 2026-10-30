import { WORKSPACE_NAME_MAX_LENGTH, workspaceNameRequestSchema } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Alert } from '@web/components/feedback/alert'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { LockedField } from '@web/components/forms/locked-field'
import { TextInput } from '@web/components/inputs/text-input'
import { PageFrame } from '@web/components/layout/page-frame'
import { workspaceSettingsQueryOptions } from '@web/features/settings/api/settings.queries'
import { useRenameWorkspace } from '@web/features/settings/api/use-rename-workspace'
import { SettingsGroupFrame } from '@web/features/settings/components/settings-group-frame'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type {
  WorkspaceNameFormProps,
  WorkspaceNameInput,
  WorkspaceNamePageProps,
} from '@web/features/settings/settings.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = settingsMessages.workspaceName
const NAME_INVALID = 'WORKSPACE_NAME_INVALID'
const SKELETON_LINES = 4

export function WorkspaceNamePage({
  workspaceId,
  workspaceName,
  permissions,
}: WorkspaceNamePageProps) {
  usePageTitle(messages.pageTitle)
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId))
  const canUpdate = hasPermission(permissions, 'settings', 'update')
  if (settings.data) {
    return (
      <PageFrame edge="bleed">
        <WorkspaceNameForm
          layout="page"
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          currency={settings.data.currency}
          canUpdate={canUpdate}
        />
      </PageFrame>
    )
  }
  return (
    <PageFrame>
      {settings.isError ? (
        <SectionError
          message={errorMessageFor(settings.error)}
          errorRef={settings.error instanceof ApiError ? settings.error.ref : null}
          isRetrying={settings.isFetching}
          onRetry={() => void settings.refetch()}
        />
      ) : (
        <SectionSkeleton lines={SKELETON_LINES} />
      )}
    </PageFrame>
  )
}

export function WorkspaceNameForm({
  workspaceId,
  workspaceName,
  currency,
  canUpdate,
  layout,
}: WorkspaceNameFormProps) {
  const rename = useRenameWorkspace(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const form = useSchemaForm({
    schema: workspaceNameRequestSchema,
    requiredMessages: messages.required,
    defaultValues: { name: workspaceName },
  })

  async function save({ name }: WorkspaceNameInput) {
    setProblem(null)
    try {
      await rename.mutateAsync(name)
      form.reset({ name })
      showToast(settingsMessages.saved, { tone: 'success' })
    } catch (error) {
      if (error instanceof ApiError && error.code === NAME_INVALID) {
        form.setError(
          'name',
          { type: 'server', message: errorMessageFor(error) },
          { shouldFocus: true },
        )
        return
      }
      setProblem(errorMessageFor(error))
    }
  }

  return (
    <Form form={form} onSubmit={save}>
      <SettingsGroupFrame
        layout={layout}
        workspaceId={workspaceId}
        title={messages.title}
        description={messages.cardDescription}
        readOnlyNote={canUpdate ? undefined : settingsMessages.readOnly}
        saveLabel={messages.save}
      >
        {problem && (
          <Alert tone="danger" isUrgent>
            {problem}
          </Alert>
        )}
        <FormField<WorkspaceNameInput>
          name="name"
          label={messages.name}
          isRequired={canUpdate}
          isReadOnly={!canUpdate}
          maxLength={WORKSPACE_NAME_MAX_LENGTH}
        >
          {(control) => <TextInput autoComplete="off" {...control} />}
        </FormField>
        <LockedField
          label={messages.currency}
          value={settingsMessages.currencyNames[currency] ?? currency}
          detail={messages.currencyLocked}
        />
      </SettingsGroupFrame>
    </Form>
  )
}

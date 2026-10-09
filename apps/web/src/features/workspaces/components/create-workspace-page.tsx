import { WORKSPACE_NAME_MAX_LENGTH, workspaceNameRequestSchema } from '@financas/shared'
import { useNavigate } from '@tanstack/react-router'
import { RichText } from '@web/components/display/rich-text'
import { Alert } from '@web/components/feedback/alert'
import { OfflineBanner } from '@web/components/feedback/offline-banner'
import { Tip } from '@web/components/feedback/tip'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { TextInput } from '@web/components/inputs/text-input'
import { AuthLayout } from '@web/components/layout/auth-layout'
import { useCreateWorkspace } from '@web/features/workspaces/api/use-create-workspace'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { CreateWorkspacePageProps } from '@web/features/workspaces/workspaces.types'
import { useIsOnline } from '@web/hooks/use-is-online'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { rememberWorkspace } from '@web/lib/last-workspace'
import { useEffect, useState } from 'react'

const messages = workspacesMessages.create
const NAME_INVALID = 'WORKSPACE_NAME_INVALID'

export function CreateWorkspacePage({ email, logOut }: CreateWorkspacePageProps) {
  usePageTitle(messages.pageTitle)
  const isOnline = useIsOnline()
  const navigate = useNavigate()
  const createWorkspace = useCreateWorkspace()
  const [problem, setProblem] = useState<string | null>(null)
  const form = useSchemaForm({
    schema: workspaceNameRequestSchema,
    requiredMessages: messages.required,
    defaultValues: { name: '' },
  })

  useEffect(() => {
    form.setFocus('name')
  }, [form])

  async function create({ name }: { name: string }) {
    setProblem(null)
    try {
      const { workspaceId } = await createWorkspace.mutateAsync(name)
      rememberWorkspace(workspaceId)
      showToast(messages.created)
      await navigate({ to: '/w/$workspaceId', params: { workspaceId } })
    } catch (error) {
      if (error instanceof ApiError && error.code === NAME_INVALID) {
        form.setError('name', { message: errorMessageFor(error) }, { shouldFocus: true })
        return
      }
      setProblem(errorMessageFor(error))
    }
  }

  return (
    <AuthLayout
      scene="space"
      title={messages.title}
      subtitle={messages.subtitle}
      banner={<OfflineBanner />}
      footer={
        <>
          <RichText text={messages.signedInAs} values={{ email }} /> · {logOut}
        </>
      }
    >
      <Form form={form} onSubmit={create} className="flex flex-col gap-4">
        <FormField name="name" label={messages.name} help={messages.nameHelp} isRequired>
          {(control) => (
            <TextInput
              autoComplete="off"
              maxLength={WORKSPACE_NAME_MAX_LENGTH}
              placeholder={messages.namePlaceholder}
              {...control}
            />
          )}
        </FormField>
        {problem && (
          <Alert tone="danger" isUrgent>
            {problem}
          </Alert>
        )}
        <SubmitButton width="full" loadingLabel={messages.submitting} isBlocked={!isOnline}>
          {messages.submit}
        </SubmitButton>
        <Tip>{messages.inviteTip}</Tip>
      </Form>
    </AuthLayout>
  )
}

import { DISPLAY_NAME_MAX_LENGTH, profileChangeSchema } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Alert } from '@web/components/feedback/alert'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { TextInput } from '@web/components/inputs/text-input'
import { PageFrame } from '@web/components/layout/page-frame'
import { SettingsFormPage } from '@web/components/layout/settings-form-page'
import { meQueryOptions } from '@web/features/auth/api/auth.queries'
import { useChangeDisplayName } from '@web/features/auth/api/use-change-display-name'
import { authMessages } from '@web/features/auth/auth.messages'
import type {
  AccountNameFormProps,
  AccountPageProps,
  DisplayNameInput,
} from '@web/features/auth/auth.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useState } from 'react'

const messages = authMessages.myAccount
const SKELETON_LINES = 3

export function AccountNamePage({ workspaceId }: AccountPageProps) {
  usePageTitle(messages.name.pageTitle)
  const me = useQuery(meQueryOptions())
  if (!me.data) {
    return (
      <PageFrame>
        <SectionSkeleton lines={SKELETON_LINES} />
      </PageFrame>
    )
  }
  return (
    <PageFrame edge="bleed">
      <AccountNameForm workspaceId={workspaceId} displayName={me.data.displayName} />
    </PageFrame>
  )
}

function AccountNameForm({ workspaceId, displayName }: AccountNameFormProps) {
  const change = useChangeDisplayName()
  const [problem, setProblem] = useState<string | null>(null)
  const form = useSchemaForm({
    schema: profileChangeSchema,
    requiredMessages: messages.name.required,
    defaultValues: { displayName },
  })

  async function save({ displayName: next }: DisplayNameInput) {
    setProblem(null)
    try {
      await change.mutateAsync(next)
      form.reset({ displayName: next })
      showToast(messages.name.saved, { tone: 'success' })
    } catch (error) {
      setProblem(errorMessageFor(error))
    }
  }

  return (
    <Form form={form} onSubmit={save}>
      <SettingsFormPage
        back={<Link to="/w/$workspaceId/account" params={{ workspaceId }} />}
        backLabel={messages.back}
        title={messages.name.title}
        footer={
          <SubmitButton requiresChange loadingLabel={messages.saving} width="full">
            {messages.name.save}
          </SubmitButton>
        }
      >
        {problem && (
          <Alert tone="danger" isUrgent>
            {problem}
          </Alert>
        )}
        <FormField<DisplayNameInput>
          name="displayName"
          label={messages.name.label}
          help={messages.name.help}
          isRequired
          maxLength={DISPLAY_NAME_MAX_LENGTH}
        >
          {(control) => <TextInput autoComplete="name" {...control} />}
        </FormField>
      </SettingsFormPage>
    </Form>
  )
}

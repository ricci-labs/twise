import { DISPLAY_NAME_MAX_LENGTH, profileChangeSchema } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Alert } from '@web/components/feedback/alert'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { LockedField } from '@web/components/forms/locked-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { TextInput } from '@web/components/inputs/text-input'
import { PageFrame } from '@web/components/layout/page-frame'
import { meQueryOptions } from '@web/features/auth/api/auth.queries'
import { useChangeDisplayName } from '@web/features/auth/api/use-change-display-name'
import { authMessages } from '@web/features/auth/auth.messages'
import type {
  AccountNameFormProps,
  AccountPageProps,
  DisplayNameInput,
} from '@web/features/auth/auth.types'
import { AccountGroupFrame } from '@web/features/auth/components/account-group-frame'
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
      <AccountNameForm
        workspaceId={workspaceId}
        displayName={me.data.displayName}
        email={me.data.email}
        layout="page"
      />
    </PageFrame>
  )
}

export function AccountNameForm({ workspaceId, displayName, email, layout }: AccountNameFormProps) {
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
      <AccountGroupFrame
        layout={layout}
        workspaceId={workspaceId}
        description={messages.name.cardDescription}
        title={layout === 'card' ? messages.name.cardTitle : messages.name.title}
        footer={
          <SubmitButton
            requiresChange
            loadingLabel={messages.saving}
            width={layout === 'page' ? 'full' : 'auto'}
          >
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
          help={layout === 'page' ? messages.name.help : undefined}
          isRequired
          maxLength={DISPLAY_NAME_MAX_LENGTH}
        >
          {(control) => <TextInput autoComplete="name" {...control} />}
        </FormField>
        {layout === 'card' && (
          <LockedField label={messages.emailRow} value={email} detail={messages.emailLocked} />
        )}
      </AccountGroupFrame>
    </Form>
  )
}

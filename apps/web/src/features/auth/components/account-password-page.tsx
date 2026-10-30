import { PASSWORD_MAX_LENGTH } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { Alert } from '@web/components/feedback/alert'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { PasswordInput } from '@web/components/inputs/password-input'
import { PageFrame } from '@web/components/layout/page-frame'
import { SettingsFormPage } from '@web/components/layout/settings-form-page'
import { useChangePassword } from '@web/features/auth/api/use-change-password'
import { authMessages } from '@web/features/auth/auth.messages'
import { passwordChangeFormSchema } from '@web/features/auth/auth.schemas'
import type {
  AccountPageProps,
  PasswordChangeInput,
  PasswordProblem,
} from '@web/features/auth/auth.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useState } from 'react'

const messages = authMessages.myAccount.password
const WRONG_CURRENT = 'CURRENT_PASSWORD_WRONG'
const TOO_MANY = 'TOO_MANY_ATTEMPTS'
const MS_PER_SECOND = 1000
const EMPTY = { currentPassword: '', newPassword: '', confirmation: '' }

export function AccountPasswordPage({ workspaceId }: AccountPageProps) {
  usePageTitle(messages.pageTitle)
  const change = useChangePassword()
  const [problem, setProblem] = useState<PasswordProblem | null>(null)
  const form = useSchemaForm({
    schema: passwordChangeFormSchema,
    requiredMessages: messages.required,
    defaultValues: EMPTY,
  })

  async function save(input: PasswordChangeInput) {
    setProblem(null)
    try {
      await change.mutateAsync({
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      })
      form.reset(EMPTY)
      showToast(messages.changed, { tone: 'success' })
    } catch (error) {
      if (error instanceof ApiError && error.code === WRONG_CURRENT) {
        form.setError(
          'currentPassword',
          { type: 'server', message: errorMessageFor(error) },
          { shouldFocus: true },
        )
        return
      }
      setProblem(problemOf(error))
    }
  }

  return (
    <PageFrame edge="bleed">
      <Form form={form} onSubmit={save}>
        <SettingsFormPage
          back={<Link to="/w/$workspaceId/account" params={{ workspaceId }} />}
          backLabel={authMessages.myAccount.back}
          title={messages.title}
          footer={
            <SubmitButton
              width="full"
              loadingLabel={messages.saving}
              waitUntil={problem?.retryAt ?? null}
              waitLabel={messages.retryIn}
            >
              {messages.save}
            </SubmitButton>
          }
        >
          {problem && (
            <Alert tone={problem.retryAt ? 'warning' : 'danger'} isUrgent>
              {problem.message}
            </Alert>
          )}
          <FormField<PasswordChangeInput>
            name="currentPassword"
            label={messages.current}
            isRequired
            maxLength={PASSWORD_MAX_LENGTH}
          >
            {(control) => <PasswordInput autoComplete="current-password" {...control} />}
          </FormField>
          <FormField<PasswordChangeInput>
            name="newPassword"
            label={messages.next}
            help={messages.nextHelp}
            isRequired
            maxLength={PASSWORD_MAX_LENGTH}
          >
            {(control) => <PasswordInput autoComplete="new-password" {...control} />}
          </FormField>
          <FormField<PasswordChangeInput>
            name="confirmation"
            label={messages.confirmation}
            isRequired
            maxLength={PASSWORD_MAX_LENGTH}
          >
            {(control) => <PasswordInput autoComplete="new-password" {...control} />}
          </FormField>
        </SettingsFormPage>
      </Form>
    </PageFrame>
  )
}

function problemOf(error: unknown): PasswordProblem {
  const message = errorMessageFor(error)
  if (error instanceof ApiError && error.code === TOO_MANY) {
    return { message, retryAt: Date.now() + (error.retryAfterSeconds ?? 0) * MS_PER_SECOND }
  }
  return { message, retryAt: null }
}

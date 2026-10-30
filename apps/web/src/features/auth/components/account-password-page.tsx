import { PASSWORD_MAX_LENGTH } from '@financas/shared'
import { Alert } from '@web/components/feedback/alert'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { PasswordInput } from '@web/components/inputs/password-input'
import { PageFrame } from '@web/components/layout/page-frame'
import { useChangePassword } from '@web/features/auth/api/use-change-password'
import { authMessages } from '@web/features/auth/auth.messages'
import { passwordChangeFormSchema } from '@web/features/auth/auth.schemas'
import type {
  AccountFormProps,
  AccountPageProps,
  PasswordChangeInput,
  PasswordProblem,
} from '@web/features/auth/auth.types'
import { AccountGroupFrame } from '@web/features/auth/components/account-group-frame'
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
  return (
    <PageFrame edge="bleed">
      <PasswordForm workspaceId={workspaceId} layout="page" />
    </PageFrame>
  )
}

export function PasswordForm({ workspaceId, layout }: AccountFormProps) {
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
    <Form form={form} onSubmit={save}>
      <AccountGroupFrame
        layout={layout}
        workspaceId={workspaceId}
        description={messages.cardDescription}
        title={layout === 'card' ? authMessages.myAccount.passwordRow : messages.title}
        footer={
          <SubmitButton
            width={layout === 'page' ? 'full' : 'auto'}
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
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:items-start lg:gap-4">
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
            help={layout === 'page' ? messages.nextHelp : undefined}
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
        </div>
      </AccountGroupFrame>
    </Form>
  )
}

function problemOf(error: unknown): PasswordProblem {
  const message = errorMessageFor(error)
  if (error instanceof ApiError && error.code === TOO_MANY) {
    return { message, retryAt: Date.now() + (error.retryAfterSeconds ?? 0) * MS_PER_SECOND }
  }
  return { message, retryAt: null }
}

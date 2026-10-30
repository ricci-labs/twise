import type { BudgetBase, InstallmentBudgetView } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Alert } from '@web/components/feedback/alert'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { FieldGroup } from '@web/components/forms/field-group'
import { Form } from '@web/components/forms/form'
import { SubmitButton } from '@web/components/forms/submit-button'
import { RadioCardList } from '@web/components/inputs/radio-card-list'
import { PageFrame } from '@web/components/layout/page-frame'
import { SettingsFormPage } from '@web/components/layout/settings-form-page'
import { workspaceSettingsQueryOptions } from '@web/features/settings/api/settings.queries'
import { useChangeSettings } from '@web/features/settings/api/use-change-settings'
import { settingsMessages } from '@web/features/settings/settings.messages'
import { budgetFormSchema } from '@web/features/settings/settings.schemas'
import type {
  BudgetFormInput,
  BudgetFormProps,
  BudgetPageProps,
} from '@web/features/settings/settings.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'
import { Controller } from 'react-hook-form'

const messages = settingsMessages.budget
const SKELETON_LINES = 6
const RECOMMENDED_BASE: BudgetBase = 'fixed_income'
const RECOMMENDED_VIEW: InstallmentBudgetView = 'per_installment'
const BASES: readonly BudgetBase[] = ['fixed_income', 'all_income']
const VIEWS: readonly InstallmentBudgetView[] = ['per_installment', 'purchase_month']

export function BudgetPage({ workspaceId, permissions }: BudgetPageProps) {
  usePageTitle(messages.pageTitle)
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId))
  if (settings.data) {
    return (
      <PageFrame edge="bleed">
        <BudgetForm
          workspaceId={workspaceId}
          settings={settings.data}
          canUpdate={hasPermission(permissions, 'settings', 'update')}
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

function BudgetForm({ workspaceId, settings, canUpdate }: BudgetFormProps) {
  const change = useChangeSettings(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const form = useSchemaForm({
    schema: budgetFormSchema,
    requiredMessages: {},
    defaultValues: {
      budgetBase: settings.budgetBase,
      installmentBudgetView: settings.installmentBudgetView,
    },
  })

  async function save(input: BudgetFormInput) {
    setProblem(null)
    try {
      await change.mutateAsync(input)
      form.reset(input)
      showToast(settingsMessages.saved, { tone: 'success' })
    } catch (error) {
      setProblem(errorMessageFor(error))
    }
  }

  const recommended = { label: messages.recommended, tone: 'neutral' as const }
  return (
    <Form form={form} onSubmit={save}>
      <SettingsFormPage
        back={<Link to="/w/$workspaceId/settings" params={{ workspaceId }} />}
        backLabel={messages.back}
        title={messages.title}
        readOnlyNote={canUpdate ? undefined : settingsMessages.readOnly}
        footer={
          <SubmitButton requiresChange loadingLabel={settingsMessages.saving} width="full">
            {messages.save}
          </SubmitButton>
        }
      >
        {problem && (
          <Alert tone="danger" isUrgent>
            {problem}
          </Alert>
        )}
        <FieldGroup label={messages.baseLabel} help={messages.baseHelp}>
          <Controller
            control={form.control}
            name="budgetBase"
            render={({ field }) => (
              <RadioCardList
                label={messages.baseLabel}
                value={field.value}
                onSelect={field.onChange}
                onBlur={field.onBlur}
                options={BASES.map((base) => ({
                  value: base,
                  label: messages.bases[base],
                  isDisabled: !canUpdate,
                  badge: base === RECOMMENDED_BASE ? recommended : undefined,
                }))}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup label={messages.viewLabel}>
          <Controller
            control={form.control}
            name="installmentBudgetView"
            render={({ field }) => (
              <RadioCardList
                label={messages.viewLabel}
                value={field.value}
                onSelect={field.onChange}
                onBlur={field.onBlur}
                options={VIEWS.map((view) => ({
                  value: view,
                  label: messages.views[view],
                  isDisabled: !canUpdate,
                  badge: view === RECOMMENDED_VIEW ? recommended : undefined,
                }))}
              />
            )}
          />
        </FieldGroup>
      </SettingsFormPage>
    </Form>
  )
}

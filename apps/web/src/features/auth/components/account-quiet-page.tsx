import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Alert } from '@web/components/feedback/alert'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { SubmitButton } from '@web/components/forms/submit-button'
import { Select } from '@web/components/inputs/select'
import { Switch } from '@web/components/inputs/switch'
import { PageFrame } from '@web/components/layout/page-frame'
import { SettingsFormPage } from '@web/components/layout/settings-form-page'
import { userPreferencesQueryOptions } from '@web/features/auth/api/auth.queries'
import { useChangeQuietHours } from '@web/features/auth/api/use-change-quiet-hours'
import { authMessages } from '@web/features/auth/auth.messages'
import { quietHoursFormSchema } from '@web/features/auth/auth.schemas'
import type {
  AccountPageProps,
  QuietHoursFormProps,
  QuietHoursInput,
  TimeSelectProps,
} from '@web/features/auth/auth.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useId, useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'

const messages = authMessages.myAccount
const copy = messages.quiet
const SKELETON_LINES = 3
const DEFAULT_START = '22:00'
const DEFAULT_END = '07:00'
const HALF_HOURS = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, '0')
  return `${hours}:${index % 2 === 0 ? '00' : '30'}`
})

export function AccountQuietPage({ workspaceId }: AccountPageProps) {
  usePageTitle(copy.pageTitle)
  const preferences = useQuery(userPreferencesQueryOptions())
  if (!preferences.data) {
    return (
      <PageFrame>
        <SectionSkeleton lines={SKELETON_LINES} />
      </PageFrame>
    )
  }
  return (
    <PageFrame edge="bleed">
      <QuietHoursForm
        workspaceId={workspaceId}
        start={preferences.data.quietHoursStart}
        end={preferences.data.quietHoursEnd}
      />
    </PageFrame>
  )
}

function QuietHoursForm({ workspaceId, start, end }: QuietHoursFormProps) {
  const change = useChangeQuietHours()
  const [problem, setProblem] = useState<string | null>(null)
  const form = useSchemaForm({
    schema: quietHoursFormSchema,
    requiredMessages: {},
    defaultValues: {
      isOn: start !== null,
      start: start ?? DEFAULT_START,
      end: end ?? DEFAULT_END,
    },
  })
  const isOn = useWatch({ control: form.control, name: 'isOn' })

  async function save(input: QuietHoursInput) {
    setProblem(null)
    try {
      await change.mutateAsync({
        quietHoursStart: input.isOn ? input.start : null,
        quietHoursEnd: input.isOn ? input.end : null,
      })
      form.reset(input)
      showToast(messages.preferencesSaved, { tone: 'success' })
    } catch (error) {
      setProblem(errorMessageFor(error))
    }
  }

  return (
    <Form form={form} onSubmit={save}>
      <SettingsFormPage
        back={<Link to="/w/$workspaceId/account" params={{ workspaceId }} />}
        backLabel={messages.back}
        title={copy.title}
        footer={
          <SubmitButton requiresChange loadingLabel={messages.saving} width="full">
            {copy.save}
          </SubmitButton>
        }
      >
        {problem && (
          <Alert tone="danger" isUrgent>
            {problem}
          </Alert>
        )}
        <Controller
          control={form.control}
          name="isOn"
          render={({ field }) => (
            <Switch
              label={copy.switch}
              help={copy.switchHelp}
              isChecked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        {isOn && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-3">
              <TimeSelect name="start" label={copy.start} />
              <TimeSelect name="end" label={copy.end} />
            </div>
            <p className="text-body-sm text-ink-muted">{copy.help}</p>
          </div>
        )}
      </SettingsFormPage>
    </Form>
  )
}

function TimeSelect({ name, label }: TimeSelectProps) {
  const id = useId()
  return (
    <Controller<QuietHoursInput, 'start' | 'end'>
      name={name}
      render={({ field }) => (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id} className="text-label font-medium text-ink">
            {label}
          </label>
          <Select
            id={id}
            title={label}
            value={field.value}
            options={timesWith(field.value).map((time) => ({ value: time, label: time }))}
            onChange={(event) => field.onChange(event.target.value)}
          />
        </div>
      )}
    />
  )
}

function timesWith(value: string): string[] {
  return HALF_HOURS.includes(value) ? HALF_HOURS : [...HALF_HOURS, value].sort()
}

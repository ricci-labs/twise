import {
  MAX_ANCHOR_BUSINESS_DAY,
  type PeriodAnchor,
  type WorkspaceSettingsChange,
} from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CategoryArt } from '@web/components/display/category-art'
import { RichText } from '@web/components/display/rich-text'
import { Alert } from '@web/components/feedback/alert'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { FieldGroup } from '@web/components/forms/field-group'
import { Form } from '@web/components/forms/form'
import { SubmitButton } from '@web/components/forms/submit-button'
import { DayField } from '@web/components/inputs/day-field'
import { RadioSentenceList } from '@web/components/inputs/radio-sentence-list'
import { Select } from '@web/components/inputs/select'
import { PageFrame } from '@web/components/layout/page-frame'
import { SettingsFormPage } from '@web/components/layout/settings-form-page'
import {
  periodPreviewQueryOptions,
  workspaceSettingsQueryOptions,
} from '@web/features/settings/api/settings.queries'
import { useChangeSettings } from '@web/features/settings/api/use-change-settings'
import { settingsMessages } from '@web/features/settings/settings.messages'
import { periodFormSchema } from '@web/features/settings/settings.schemas'
import type {
  PeriodAnchorChoice,
  PeriodChoiceFieldProps,
  PeriodFormInput,
  PeriodFormProps,
  PeriodPageProps,
  PeriodPreviewProps,
  WatchedPeriodPreviewProps,
} from '@web/features/settings/settings.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatDayMonth, formatRange } from '@web/lib/format/calendar'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

const messages = settingsMessages.period
const SKELETON_LINES = 6
const SUGGESTED_DAY = '5'
const CALENDAR_MONTH = 'calendar_month'
const DAY_OF_MONTH = 'day_of_month'
const BUSINESS_DAY = 'nth_business_day'
const BUSINESS_DAY_OPTIONS = Array.from({ length: MAX_ANCHOR_BUSINESS_DAY }, (_, index) => ({
  value: String(index + 1),
  label: messages.businessDay.option(index + 1),
}))

export function PeriodPage({ workspaceId, permissions }: PeriodPageProps) {
  usePageTitle(messages.pageTitle)
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId))
  if (settings.data) {
    return (
      <PageFrame edge="bleed">
        <PeriodForm
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

export function periodChoiceOf(input: PeriodFormInput): PeriodAnchorChoice {
  if (input.periodAnchor === DAY_OF_MONTH) {
    return { anchor: DAY_OF_MONTH, value: Number(input.dayOfMonth) }
  }
  if (input.periodAnchor === BUSINESS_DAY) {
    return { anchor: BUSINESS_DAY, value: Number(input.businessDay) }
  }
  return { anchor: CALENDAR_MONTH, value: null }
}

function PeriodForm({ workspaceId, settings, canUpdate }: PeriodFormProps) {
  const change = useChangeSettings(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const form = useSchemaForm({
    schema: periodFormSchema,
    requiredMessages: {},
    defaultValues: periodValuesOf(settings.periodAnchor, settings.periodAnchorValue),
  })

  async function save(input: PeriodFormInput) {
    setProblem(null)
    const { anchor, value } = periodChoiceOf(input)
    const request: WorkspaceSettingsChange = { periodAnchor: anchor, periodAnchorValue: value }
    try {
      await change.mutateAsync(request)
      form.reset(input)
      showToast(settingsMessages.saved, { tone: 'success' })
    } catch (error) {
      setProblem(errorMessageFor(error))
    }
  }

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
        <PeriodChoiceField isDisabled={!canUpdate} />
        <WatchedPeriodPreview workspaceId={workspaceId} />
      </SettingsFormPage>
    </Form>
  )
}

function PeriodChoiceField({ isDisabled }: PeriodChoiceFieldProps) {
  const { setValue } = useFormContext<PeriodFormInput>()
  const [anchor, dayOfMonth, businessDay] = useWatch<
    PeriodFormInput,
    ['periodAnchor', 'dayOfMonth', 'businessDay']
  >({ name: ['periodAnchor', 'dayOfMonth', 'businessDay'] })
  const choose = (next: PeriodAnchor) => setValue('periodAnchor', next, { shouldDirty: true })
  return (
    <FieldGroup label={messages.label} help={messages.help}>
      <RadioSentenceList
        label={messages.label}
        value={anchor}
        disabled={isDisabled}
        onSelect={(next) => choose(periodAnchorOf(next))}
        options={[
          { value: CALENDAR_MONTH, label: messages.calendarMonth, before: messages.calendarMonth },
          {
            value: DAY_OF_MONTH,
            label: messages.day.label(dayOfMonth),
            before: messages.day.before,
            picker: (
              <DayField
                size="inline"
                aria-label={messages.day.picker(dayOfMonth)}
                title={messages.day.title}
                summary={messages.day.summary}
                value={dayOfMonth}
                disabled={isDisabled}
                onChange={(event) => {
                  setValue('dayOfMonth', event.target.value, { shouldDirty: true })
                  choose(DAY_OF_MONTH)
                }}
              />
            ),
          },
          {
            value: BUSINESS_DAY,
            label: messages.businessDay.label(businessDay),
            before: messages.businessDay.before,
            after: messages.businessDay.after,
            picker: (
              <Select
                size="inline"
                aria-label={messages.businessDay.picker(businessDay)}
                title={messages.businessDay.title}
                options={BUSINESS_DAY_OPTIONS}
                value={businessDay}
                disabled={isDisabled}
                onChange={(event) => {
                  setValue('businessDay', event.target.value, { shouldDirty: true })
                  choose(BUSINESS_DAY)
                }}
              />
            ),
          },
        ]}
      />
    </FieldGroup>
  )
}

function WatchedPeriodPreview({ workspaceId }: WatchedPeriodPreviewProps) {
  const [periodAnchor, dayOfMonth, businessDay] = useWatch<
    PeriodFormInput,
    ['periodAnchor', 'dayOfMonth', 'businessDay']
  >({ name: ['periodAnchor', 'dayOfMonth', 'businessDay'] })
  return (
    <PeriodPreview
      workspaceId={workspaceId}
      choice={periodChoiceOf({ periodAnchor, dayOfMonth, businessDay })}
    />
  )
}

function PeriodPreview({ workspaceId, choice }: PeriodPreviewProps) {
  const preview = useQuery(periodPreviewQueryOptions(workspaceId, choice.anchor, choice.value))
  if (preview.isError) {
    return <p className="text-body-sm text-ink-muted">{messages.previewFailed}</p>
  }
  if (!preview.data) {
    return <SectionSkeleton lines={2} />
  }
  const { current, next } = preview.data
  return (
    <div role="status" className="flex items-start gap-3 rounded-lg bg-sunken px-3.5 py-3">
      <CategoryArt name={messages.title} icon="calendar" size="md" />
      <div className="flex flex-1 flex-col pt-0.5 text-body-sm text-ink">
        <p>
          <RichText
            text={messages.current}
            values={{ periodo: formatRange(current.start, current.end) }}
          />
        </p>
        <p className="text-ink-muted">
          <RichText
            text={messages.next}
            values={{ inicio: formatDayMonth(next.start), fim: formatDayMonth(next.end) }}
          />
        </p>
      </div>
    </div>
  )
}

function periodAnchorOf(value: string): PeriodAnchor {
  if (value === DAY_OF_MONTH || value === BUSINESS_DAY) {
    return value
  }
  return CALENDAR_MONTH
}

function periodValuesOf(anchor: PeriodAnchor, value: number | null): PeriodFormInput {
  const saved = value === null ? SUGGESTED_DAY : String(value)
  return {
    periodAnchor: anchor,
    dayOfMonth: anchor === DAY_OF_MONTH ? saved : SUGGESTED_DAY,
    businessDay: anchor === BUSINESS_DAY ? saved : SUGGESTED_DAY,
  }
}

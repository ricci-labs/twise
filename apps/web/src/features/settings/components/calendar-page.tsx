import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { Alert } from '@web/components/feedback/alert'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { FieldGroup } from '@web/components/forms/field-group'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { PickerField } from '@web/components/inputs/picker-field'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import { PageFrame } from '@web/components/layout/page-frame'
import { SettingsFormPage } from '@web/components/layout/settings-form-page'
import { workspaceSettingsQueryOptions } from '@web/features/settings/api/settings.queries'
import { useChangeSettings } from '@web/features/settings/api/use-change-settings'
import {
  brazilZoneItems,
  OTHER_ZONES,
  otherZoneItems,
  timezoneText,
} from '@web/features/settings/components/timezone-views'
import { settingsMessages } from '@web/features/settings/settings.messages'
import { calendarFormSchema } from '@web/features/settings/settings.schemas'
import type {
  CalendarFormInput,
  CalendarFormProps,
  CalendarPageProps,
  TimezoneFieldProps,
  ZoneSheet,
} from '@web/features/settings/settings.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { hasPermission } from '@web/lib/permissions'
import { Globe } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

const messages = settingsMessages.calendar
const SKELETON_LINES = 4
const WEEK_OPTIONS = [0, 1].map((day) => ({
  value: String(day),
  label: messages.weekdays[day] ?? '',
}))

export function CalendarPage({ workspaceId, permissions }: CalendarPageProps) {
  usePageTitle(messages.pageTitle)
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId))
  if (settings.data) {
    return (
      <PageFrame edge="bleed">
        <CalendarForm
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

function CalendarForm({ workspaceId, settings, canUpdate }: CalendarFormProps) {
  const change = useChangeSettings(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const form = useSchemaForm({
    schema: calendarFormSchema,
    requiredMessages: {},
    defaultValues: { weekStartsOn: settings.weekStartsOn, timezone: settings.timezone },
  })

  async function save(input: CalendarFormInput) {
    setProblem(null)
    try {
      await change.mutateAsync(input)
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
        <FieldGroup label={messages.weekLabel}>
          <Controller
            control={form.control}
            name="weekStartsOn"
            render={({ field }) => (
              <SegmentedControl
                label={messages.weekLabel}
                width="full"
                selection="outline"
                options={WEEK_OPTIONS}
                value={String(field.value)}
                isDisabled={!canUpdate}
                onValueChange={(next) => field.onChange(Number(next))}
              />
            )}
          />
        </FieldGroup>
        <TimezoneField isDisabled={!canUpdate} />
      </SettingsFormPage>
    </Form>
  )
}

function TimezoneField({ isDisabled }: TimezoneFieldProps) {
  const { setValue } = useFormContext<CalendarFormInput>()
  const timezone = useWatch<CalendarFormInput, 'timezone'>({ name: 'timezone' })
  const [openSheet, setOpenSheet] = useState<ZoneSheet | null>(null)
  const anchor = useRef<HTMLButtonElement>(null)
  const now = useMemo(() => new Date(), [])
  const others = useMemo(
    () => (openSheet === 'others' ? otherZoneItems(now) : []),
    [openSheet, now],
  )
  const chosen = timezoneText(timezone, now)
  const choose = (zone: string) => setValue('timezone', zone, { shouldDirty: true })

  return (
    <>
      <FormField<CalendarFormInput>
        name="timezone"
        label={messages.zoneLabel}
        help={messages.zoneHelp}
      >
        {(control) => (
          <PickerField
            id={control.id}
            ref={(element) => {
              anchor.current = element
              control.ref(element)
            }}
            aria-describedby={control['aria-describedby']}
            value={chosen.label}
            detail={chosen.detail}
            art={<Globe aria-hidden="true" className="size-4.5 text-ink-muted" />}
            placeholder={messages.zoneLabel}
            disabled={isDisabled}
            onClick={() => setOpenSheet('brazil')}
          />
        )}
      </FormField>
      <PickerSheet
        title={messages.zoneLabel}
        subtitle={messages.zoneSubtitle}
        items={brazilZoneItems()}
        value={timezone}
        anchor={anchor}
        isOpen={openSheet === 'brazil'}
        onOpenChange={(isOpen) =>
          setOpenSheet((current) => (isOpen ? 'brazil' : closed(current, 'brazil')))
        }
        onSelect={(zone) => (zone === OTHER_ZONES ? setOpenSheet('others') : choose(zone))}
      />
      <PickerSheet
        title={messages.others}
        items={others}
        value={timezone}
        searchLabel={messages.search}
        anchor={anchor}
        isOpen={openSheet === 'others'}
        onOpenChange={(isOpen) =>
          setOpenSheet((current) => (isOpen ? 'others' : closed(current, 'others')))
        }
        onSelect={choose}
      />
    </>
  )
}

function closed(current: ZoneSheet | null, closing: ZoneSheet): ZoneSheet | null {
  return current === closing ? null : current
}

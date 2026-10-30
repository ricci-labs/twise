import { addDays, MAX_NOTIFY_DAYS_BEFORE, todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { CategoryArt } from '@web/components/display/category-art'
import { RichText } from '@web/components/display/rich-text'
import { Alert } from '@web/components/feedback/alert'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { FieldGroup } from '@web/components/forms/field-group'
import { Form } from '@web/components/forms/form'
import { SubmitButton } from '@web/components/forms/submit-button'
import { Stepper } from '@web/components/inputs/stepper'
import { PageFrame } from '@web/components/layout/page-frame'
import {
  memberPreferencesQueryOptions,
  upcomingBillsQueryOptions,
} from '@web/features/auth/api/auth.queries'
import { useChangeMemberPreferences } from '@web/features/auth/api/use-change-member-preferences'
import { authMessages } from '@web/features/auth/auth.messages'
import { noticesFormSchema } from '@web/features/auth/auth.schemas'
import type {
  AccountNoticesPageProps,
  NoticeExampleProps,
  NoticesFormProps,
  NoticesInput,
} from '@web/features/auth/auth.types'
import { AccountGroupFrame } from '@web/features/auth/components/account-group-frame'
import { usePageTitle } from '@web/hooks/use-page-title'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatShortDate } from '@web/lib/format/calendar'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'

const messages = authMessages.myAccount
const copy = messages.notices
const SKELETON_LINES = 4
const TIME_ZONE = 'America/Sao_Paulo'
const EXPENSE = 'expense'
const PENDING = 'pending'

export function AccountNoticesPage({ workspaceId, workspaceName }: AccountNoticesPageProps) {
  usePageTitle(copy.title(workspaceName))
  const preferences = useQuery(memberPreferencesQueryOptions(workspaceId))
  if (!preferences.data) {
    return (
      <PageFrame>
        <SectionSkeleton lines={SKELETON_LINES} />
      </PageFrame>
    )
  }
  return (
    <PageFrame edge="bleed">
      <NoticesForm
        layout="page"
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        daysBefore={preferences.data.notifyBillsDaysBefore}
      />
    </PageFrame>
  )
}

export function NoticesForm({ workspaceId, workspaceName, daysBefore, layout }: NoticesFormProps) {
  const change = useChangeMemberPreferences(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const form = useSchemaForm({
    schema: noticesFormSchema,
    requiredMessages: {},
    defaultValues: { daysBefore },
  })
  const days = useWatch({ control: form.control, name: 'daysBefore' })

  async function save(input: NoticesInput) {
    setProblem(null)
    try {
      await change.mutateAsync({ notifyBillsDaysBefore: input.daysBefore })
      form.reset(input)
      showToast(messages.preferencesSaved, { tone: 'success' })
    } catch (error) {
      setProblem(errorMessageFor(error))
    }
  }

  return (
    <Form form={form} onSubmit={save}>
      <AccountGroupFrame
        layout={layout}
        workspaceId={workspaceId}
        description={copy.cardDescription}
        title={copy.title(workspaceName)}
        footer={
          <SubmitButton
            requiresChange
            loadingLabel={messages.saving}
            width={layout === 'page' ? 'full' : 'auto'}
          >
            {copy.save}
          </SubmitButton>
        }
      >
        {layout === 'page' && (
          <p className="-mt-2 text-body-sm text-ink-muted">{copy.lead(workspaceName)}</p>
        )}
        {problem && (
          <Alert tone="danger" isUrgent>
            {problem}
          </Alert>
        )}
        <FieldGroup label={copy.days} isRequired help={copy.help}>
          <Controller
            control={form.control}
            name="daysBefore"
            render={({ field }) => (
              <Stepper
                value={field.value}
                min={0}
                max={MAX_NOTIFY_DAYS_BEFORE}
                valueText={copy.daysValue(field.value)}
                decreaseLabel={copy.decrease}
                increaseLabel={copy.increase}
                onChange={field.onChange}
              />
            )}
          />
        </FieldGroup>
        <NoticeExample workspaceId={workspaceId} daysBefore={days} />
      </AccountGroupFrame>
    </Form>
  )
}

function NoticeExample({ workspaceId, daysBefore }: NoticeExampleProps) {
  const today = todayIn(TIME_ZONE, new Date())
  const bills = useQuery(upcomingBillsQueryOptions(workspaceId, today)).data?.items ?? []
  const pending = bills.filter((bill) => bill.entryType === EXPENSE && bill.status === PENDING)
  const bill = pending.find((item) => addDays(item.dueOn, -daysBefore) >= today) ?? pending[0]
  if (!bill) {
    return null
  }
  return (
    <div role="status" className="flex items-start gap-3 rounded-lg bg-sunken px-3.5 py-3">
      <CategoryArt name={copy.exampleTitle} icon="calendar" size="md" />
      <div className="flex flex-1 flex-col pt-0.5 text-body-sm text-ink">
        <p>{copy.exampleTitle}</p>
        <p>
          <RichText
            text={daysBefore === 0 ? copy.exampleSameDay : copy.example}
            values={{
              conta: bill.description,
              vencimento: formatShortDate(bill.dueOn),
              aviso: formatShortDate(addDays(bill.dueOn, -daysBefore)),
            }}
          />
        </p>
      </div>
    </div>
  )
}

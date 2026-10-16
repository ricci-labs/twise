import { GOAL_NAME_MAX_LENGTH } from '@financas/shared'
import { TextLink } from '@web/components/actions/text-link'
import { Alert } from '@web/components/feedback/alert'
import { FormField } from '@web/components/forms/form-field'
import { DateInput } from '@web/components/inputs/date-input'
import { MoneyInput } from '@web/components/inputs/money-input'
import { Switch } from '@web/components/inputs/switch'
import { TextInput } from '@web/components/inputs/text-input'
import { GoalAccountField } from '@web/features/planning/components/goal-account-field'
import { GoalPreview } from '@web/features/planning/components/goal-preview'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { GoalFieldsProps, GoalFormValues } from '@web/features/planning/planning.types'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

const messages = planningMessages.goals.form

export function GoalFields({
  workspaceId,
  today,
  accounts,
  goals,
  editingGoalId,
  nameInput,
}: GoalFieldsProps) {
  const otherReserve = goals.find((goal) => goal.isReserve && goal.id !== editingGoalId)
  const reserveAccount = accounts.find((account) => account.id === otherReserve?.accountId)
  return (
    <>
      <p className="mx-4 mt-3.5 text-note text-ink-muted lg:mx-8">
        <span aria-hidden="true" className="font-semibold text-danger">
          {planningMessages.form.requiredMark}
        </span>{' '}
        {planningMessages.form.requiredLegend}
      </p>
      <div className="grid gap-4.5 px-4 pt-2.5 pb-6 lg:grid-cols-2 lg:items-start lg:gap-x-6 lg:px-8">
        <Alert tone="info" className="lg:col-span-2">
          {messages.help}
        </Alert>
        <FormField<GoalFormValues>
          name="name"
          label={messages.name}
          isRequired
          maxLength={GOAL_NAME_MAX_LENGTH}
        >
          {(control) => (
            <TextInput
              autoComplete="off"
              placeholder={messages.namePlaceholder}
              {...control}
              ref={(element) => {
                nameInput.current = element
                control.ref(element)
              }}
            />
          )}
        </FormField>
        <FormField<GoalFormValues> name="target" label={messages.target} isRequired>
          {(control) => <MoneyInput size="lg" {...control} />}
        </FormField>
        <GoalAccountField
          workspaceId={workspaceId}
          accounts={accounts}
          goals={goals}
          editingGoalId={editingGoalId}
        />
        <DeadlineField today={today} />
        <GoalPreview workspaceId={workspaceId} accounts={accounts} />
        <Controller<GoalFormValues, 'isReserve'>
          name="isReserve"
          render={({ field }) => (
            <Switch
              className="lg:col-span-2"
              label={messages.reserve}
              help={
                reserveAccount
                  ? messages.reserveTakenHelp(reserveAccount.name)
                  : messages.reserveHelp
              }
              isChecked={field.value}
              isDisabled={otherReserve !== undefined}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>
    </>
  )
}

function DeadlineField({ today }: { today: GoalFieldsProps['today'] }) {
  const { setValue } = useFormContext<GoalFormValues>()
  const targetOn = useWatch<GoalFormValues, 'targetOn'>({ name: 'targetOn' })
  return (
    <div className="flex flex-col gap-1.5">
      <FormField<GoalFormValues> name="targetOn" label={messages.targetOn}>
        {(control) => (
          <DateInput
            title={messages.targetOn}
            today={today}
            placeholder={messages.noDeadline}
            {...control}
          />
        )}
      </FormField>
      {targetOn && (
        <TextLink
          render={<button type="button" />}
          className="self-start text-body-sm"
          onClick={() => setValue('targetOn', '', { shouldDirty: true })}
        >
          {messages.clearDeadline}
        </TextLink>
      )}
    </div>
  )
}

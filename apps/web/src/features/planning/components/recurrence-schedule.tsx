import {
  MAX_RECURRENCE_BUSINESS_DAY,
  MAX_RECURRENCE_INTERVAL,
  parseIsoDate,
  RECURRENCE_FREQUENCIES,
  WEEKEND_RULES,
} from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { TextLink } from '@web/components/actions/text-link'
import { FieldGroup } from '@web/components/forms/field-group'
import { FormField } from '@web/components/forms/form-field'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { DateInput } from '@web/components/inputs/date-input'
import { DayField } from '@web/components/inputs/day-field'
import { RadioSentenceList } from '@web/components/inputs/radio-sentence-list'
import { Select } from '@web/components/inputs/select'
import { Stepper } from '@web/components/inputs/stepper'
import { Switch } from '@web/components/inputs/switch'
import { planningMessages } from '@web/features/planning/planning.messages'
import { DAY_RULES } from '@web/features/planning/planning.schemas'
import type {
  BusinessDayHelpProps,
  DayRule,
  RecurrenceFormInput,
  RecurrenceScheduleFieldsProps,
} from '@web/features/planning/planning.types'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

const messages = planningMessages.form
const rules = messages.dayRules
const WEEKLY = 'weekly'
const BUSINESS_DAY = 'businessDay'
const FREQUENCY_OPTIONS = RECURRENCE_FREQUENCIES.map((frequency) => ({
  value: frequency,
  label: messages.frequencies[frequency],
}))
const WEEKEND_OPTIONS = WEEKEND_RULES.map((rule) => ({
  value: rule,
  label: messages.weekendRules[rule],
}))
const BUSINESS_DAY_OPTIONS = Array.from({ length: MAX_RECURRENCE_BUSINESS_DAY }, (_, index) => ({
  value: String(index + 1),
  label: rules.businessDay.option(index + 1),
}))

export function RecurrenceScheduleFields({ workspaceId, today }: RecurrenceScheduleFieldsProps) {
  const [frequency, dayRule, hasEnd] = useWatch<
    RecurrenceFormInput,
    ['frequency', 'dayRule', 'hasEnd']
  >({ name: ['frequency', 'dayRule', 'hasEnd'] })
  const isWeekly = frequency === WEEKLY
  const usesBusinessDay = !isWeekly && dayRule === BUSINESS_DAY
  return (
    <>
      <FrequencyField />
      {!isWeekly && <DayRuleField workspaceId={workspaceId} />}
      {!usesBusinessDay && (
        <FormField<RecurrenceFormInput> name="weekendRule" label={messages.weekend} isRequired>
          {(control) => <Select title={messages.weekend} options={WEEKEND_OPTIONS} {...control} />}
        </FormField>
      )}
      <StartsOnField workspaceId={workspaceId} today={today} />
      <div className="flex flex-col gap-3 lg:col-span-2">
        <Controller<RecurrenceFormInput, 'hasEnd'>
          name="hasEnd"
          render={({ field }) => (
            <Switch
              label={messages.hasEnd}
              isChecked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        {hasEnd && (
          <FormField<RecurrenceFormInput> name="endsOn" label={messages.endsOn} isRequired>
            {(control) => <DateInput title={messages.endsOn} today={today} {...control} />}
          </FormField>
        )}
      </div>
    </>
  )
}

function FrequencyField() {
  return (
    <FieldGroup label={messages.frequency} isRequired>
      <Controller<RecurrenceFormInput, 'frequency'>
        name="frequency"
        render={({ field }) => (
          <ChoiceChips
            label={messages.frequency}
            variant="pillOutline"
            options={FREQUENCY_OPTIONS}
            value={field.value}
            onSelect={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <IntervalStepper />
    </FieldGroup>
  )
}

function IntervalStepper() {
  const frequency = useWatch<RecurrenceFormInput, 'frequency'>({ name: 'frequency' })
  return (
    <Controller<RecurrenceFormInput, 'interval'>
      name="interval"
      render={({ field }) => (
        <div className="mt-0.5">
          <Stepper
            size="sm"
            value={field.value}
            min={1}
            max={MAX_RECURRENCE_INTERVAL}
            onChange={field.onChange}
            valueText={String(field.value)}
            decreaseLabel={messages.fewer}
            increaseLabel={messages.more}
            lead={messages.every}
            aside={messages.units[frequency](field.value)}
          />
        </div>
      )}
    />
  )
}

function DayRuleField({ workspaceId }: BusinessDayHelpProps) {
  const { setValue } = useFormContext<RecurrenceFormInput>()
  const [dayRule, dayOfMonth, nthBusinessDay] = useWatch<
    RecurrenceFormInput,
    ['dayRule', 'dayOfMonth', 'nthBusinessDay']
  >({ name: ['dayRule', 'dayOfMonth', 'nthBusinessDay'] })
  const choose = (rule: DayRule) => setValue('dayRule', rule, { shouldDirty: true })
  return (
    <FieldGroup
      label={messages.when}
      isRequired
      note={
        dayRule === BUSINESS_DAY ? (
          <BusinessDayHelp workspaceId={workspaceId} />
        ) : (
          messages.shortMonths
        )
      }
    >
      <RadioSentenceList
        label={messages.when}
        value={dayRule}
        onSelect={(next) => choose(DAY_RULES.find((rule) => rule === next) ?? 'day')}
        options={[
          {
            value: 'day',
            label: rules.day.label(dayOfMonth),
            before: rules.day.before,
            after: rules.day.after,
            picker: (
              <DayField
                size="inline"
                aria-label={rules.day.picker(dayOfMonth)}
                title={rules.day.title}
                summary={rules.day.summary}
                value={dayOfMonth}
                onChange={(event) => {
                  setValue('dayOfMonth', event.target.value, { shouldDirty: true })
                  choose('day')
                }}
              />
            ),
          },
          {
            value: BUSINESS_DAY,
            label: rules.businessDay.label(nthBusinessDay),
            before: rules.businessDay.before,
            after: rules.businessDay.after,
            picker: (
              <Select
                size="inline"
                aria-label={rules.businessDay.picker(nthBusinessDay)}
                title={rules.businessDay.title}
                options={BUSINESS_DAY_OPTIONS}
                value={nthBusinessDay}
                onChange={(event) => {
                  setValue('nthBusinessDay', event.target.value, { shouldDirty: true })
                  choose(BUSINESS_DAY)
                }}
              />
            ),
          },
          { value: 'sameDay', label: rules.sameDay.label, before: rules.sameDay.label },
        ]}
      />
    </FieldGroup>
  )
}

function BusinessDayHelp({ workspaceId }: BusinessDayHelpProps) {
  return (
    <>
      {messages.businessDayHelp}{' '}
      <TextLink render={<Link to="/w/$workspaceId/settings/holidays" params={{ workspaceId }} />}>
        {messages.seeHolidays}
      </TextLink>
    </>
  )
}

function StartsOnField({ today }: RecurrenceScheduleFieldsProps) {
  const { getValues, setValue } = useFormContext<RecurrenceFormInput>()
  const isDayFollowingTheFirstDate = () => getValues('dayOfMonth') === dayOf(getValues('startsOn'))
  return (
    <FormField<RecurrenceFormInput>
      name="startsOn"
      label={messages.startsOn}
      help={messages.startsOnHelp}
      isRequired
    >
      {(control) => (
        <DateInput
          title={messages.startsOn}
          today={today}
          {...control}
          onChange={(event) => {
            if (isDayFollowingTheFirstDate()) {
              setValue('dayOfMonth', dayOf(event.target.value))
            }
            control.onChange(event)
          }}
        />
      )}
    </FormField>
  )
}

function dayOf(date: string): string {
  return String(parseIsoDate(date).day)
}

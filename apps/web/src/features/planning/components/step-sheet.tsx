import { formatBrl, MONEY_ACCOUNT_KINDS } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { RichText } from '@web/components/display/rich-text'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { MoneyInput } from '@web/components/inputs/money-input'
import type { PickerItem } from '@web/components/inputs/picker-sheet'
import { RadioCardList } from '@web/components/inputs/radio-card-list'
import { Stepper } from '@web/components/inputs/stepper'
import { Sheet } from '@web/components/layout/sheet'
import { RecurrencePicker } from '@web/features/planning/components/recurrence-picker'
import { planningMessages } from '@web/features/planning/planning.messages'
import { stepFormSchema } from '@web/features/planning/planning.schemas'
import type {
  PercentFieldProps,
  StepFieldsProps,
  StepFormValues,
  StepKind,
  StepShape,
  StepSheetProps,
  StepTypeStageProps,
} from '@web/features/planning/planning.types'
import { centsOfTypedAmount, formatTypedAmount } from '@web/lib/format/money'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'

const messages = planningMessages.split.sheet
const KINDS: readonly StepKind[] = [
  'fill_goal',
  'cover_overspent',
  'percent',
  'fixed_amount',
  'rest',
]
const MONEY_KINDS: readonly string[] = MONEY_ACCOUNT_KINDS
const DEFAULT_PERCENT = 10
const PERCENT = 100
const WALLET_ICON = 'wallet'

export function StepSheet(props: StepSheetProps) {
  const [kind, setKind] = useState<StepKind | null>(props.editing?.kind ?? null)
  const [isChoosing, setIsChoosing] = useState(props.editing === null)
  const title = isChoosing || kind === null ? messages.addTitle : messages.types[kind]
  return (
    <Sheet
      title={title}
      closeLabel={messages.cancel}
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      {isChoosing || kind === null ? (
        <TypeStage
          kind={kind}
          restAccountName={props.restAccountName}
          onCancel={() => props.onOpenChange(false)}
          onContinue={(chosen) => {
            setKind(chosen)
            if (chosen === 'cover_overspent') {
              props.onSave(stepOf({ ...blankValues(chosen) }))
              props.onOpenChange(false)
              return
            }
            setIsChoosing(false)
          }}
        />
      ) : (
        <StepFields {...props} kind={kind} onBack={() => setIsChoosing(true)} />
      )}
    </Sheet>
  )
}

function TypeStage({ kind, restAccountName, onCancel, onContinue }: StepTypeStageProps) {
  const [chosen, setChosen] = useState<StepKind | null>(kind)
  return (
    <div className="flex flex-col gap-4">
      <RadioCardList
        label={messages.typeLabel}
        layout="stack"
        value={chosen}
        onSelect={(value) => setChosen(KINDS.find((candidate) => candidate === value) ?? null)}
        options={KINDS.map((option) => ({
          value: option,
          label: messages.types[option],
          detail:
            option === 'rest' && restAccountName !== null
              ? messages.restTaken(restAccountName)
              : messages.typeHelp[option],
          isDisabled: option === 'rest' && restAccountName !== null,
        }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onCancel}>
          {messages.cancel}
        </Button>
        <Button isDisabled={chosen === null} onClick={() => chosen && onContinue(chosen)}>
          {messages.continue}
        </Button>
      </div>
    </div>
  )
}

function StepFields({
  kind,
  editing,
  goals,
  accounts,
  exampleCents,
  onSave,
  onOpenChange,
  onBack,
}: StepFieldsProps) {
  const form = useSchemaForm({
    schema: stepFormSchema,
    requiredMessages: messages.required,
    defaultValues: editing ? valuesOf(editing) : blankValues(kind),
  })
  const goalOf = new Map(goals.map((goal) => [goal.accountId, goal]))
  const accountItems: PickerItem[] = accounts
    .filter(
      (account) =>
        MONEY_KINDS.includes(account.kind) && !account.isSystem && account.archivedAt === null,
    )
    .map((account) => {
      const goal = goalOf.get(account.id)
      return {
        value: account.id,
        label: account.name,
        icon: account.icon ?? WALLET_ICON,
        detail: goal && goalNoteOf(goal),
      }
    })
  const goalItems: PickerItem[] = goals.map((goal) => ({
    value: goal.id,
    label: goal.name,
    icon: accounts.find((account) => account.id === goal.accountId)?.icon ?? WALLET_ICON,
  }))
  return (
    <Form
      form={form}
      onSubmit={(values: StepFormValues) => {
        onSave(stepOf(values))
        onOpenChange(false)
      }}
      className="flex flex-col gap-4"
    >
      {kind === 'fill_goal' ? (
        <FormField<StepFormValues> name="goalId" label={messages.goal} isRequired>
          {(control) => (
            <RecurrencePicker
              control={control}
              title={messages.goal}
              placeholder={messages.goalPlaceholder}
              items={goalItems}
              empty={{ icon: 'piggy-bank', ...messages.goalsEmpty }}
            />
          )}
        </FormField>
      ) : (
        <FormField<StepFormValues> name="accountId" label={messages.account} isRequired>
          {(control) => (
            <RecurrencePicker
              control={control}
              title={messages.account}
              subtitle={messages.accountSubtitle}
              placeholder={messages.accountPlaceholder}
              items={accountItems}
              empty={{ icon: WALLET_ICON, ...messages.accountsEmpty }}
            />
          )}
        </FormField>
      )}
      {kind === 'percent' && <PercentField exampleCents={exampleCents} />}
      {kind === 'fixed_amount' && (
        <FormField<StepFormValues> name="amount" label={messages.amount} isRequired>
          {(control) => <MoneyInput {...control} />}
        </FormField>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={editing ? () => onOpenChange(false) : onBack}>
          {editing ? messages.cancel : messages.back}
        </Button>
        <Button type="submit">{editing ? messages.save : messages.add}</Button>
      </div>
    </Form>
  )
}

function PercentField({ exampleCents }: PercentFieldProps) {
  const percent = useWatch<StepFormValues, 'percent'>({ name: 'percent' })
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label">{messages.percent}</span>
      <p className="text-note text-ink-muted">{messages.percentHelp}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Controller<StepFormValues, 'percent'>
          name="percent"
          render={({ field }) => (
            <Stepper
              value={field.value}
              min={1}
              max={PERCENT}
              onChange={field.onChange}
              valueText={`${field.value}%`}
              decreaseLabel={messages.fewer}
              increaseLabel={messages.more}
            />
          )}
        />
        <p className="text-body-sm text-ink-muted">
          <RichText
            text={messages.percentGives(
              formatBrl(exampleCents),
              formatBrl(Math.floor((exampleCents * percent) / PERCENT)),
            )}
          />
        </p>
      </div>
    </div>
  )
}

function blankValues(kind: StepKind): StepFormValues {
  return { kind, goalId: '', accountId: '', percent: DEFAULT_PERCENT, amount: '' }
}

function valuesOf(step: NonNullable<StepSheetProps['editing']>): StepFormValues {
  return {
    kind: step.kind,
    goalId: step.goalId ?? '',
    accountId: step.accountId ?? '',
    percent: step.percent ?? DEFAULT_PERCENT,
    amount: step.amountCents ? formatTypedAmount(step.amountCents) : '',
  }
}

function stepOf(values: StepFormValues): StepShape {
  const usesAccount = values.kind !== 'fill_goal' && values.kind !== 'cover_overspent'
  return {
    kind: values.kind,
    goalId: values.kind === 'fill_goal' ? values.goalId : null,
    accountId: usesAccount ? values.accountId : null,
    percent: values.kind === 'percent' ? values.percent : null,
    amountCents:
      values.kind === 'fixed_amount' ? (centsOfTypedAmount(values.amount) ?? null) : null,
  }
}

function goalNoteOf(goal: StepFieldsProps['goals'][number]): string {
  return goal.isReserve ? messages.accountOfReserve : messages.accountOfGoal(goal.name)
}

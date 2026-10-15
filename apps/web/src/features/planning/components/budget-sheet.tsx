import { formatBrl } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import { RichText } from '@web/components/display/rich-text'
import { Alert } from '@web/components/feedback/alert'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { MoneyInput } from '@web/components/inputs/money-input'
import { Select } from '@web/components/inputs/select'
import { Sheet } from '@web/components/layout/sheet'
import { useSetBudget } from '@web/features/planning/api/use-set-budget'
import { planningMessages } from '@web/features/planning/planning.messages'
import { budgetFormSchema } from '@web/features/planning/planning.schemas'
import type {
  BudgetFormInput,
  BudgetSheetProps,
  BudgetSheetViewProps,
} from '@web/features/planning/planning.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatMonthLabel } from '@web/lib/format/calendar'
import { centsOfTypedAmount, formatTypedAmount } from '@web/lib/format/money'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { useState } from 'react'

const copy = planningMessages.budgets.sheet

export function BudgetSheet(props: BudgetSheetProps) {
  return (
    <Sheet
      title={copy.title(props.view.name)}
      closeLabel={copy.cancel}
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      {props.isOpen && <BudgetSheetBody {...props} />}
    </Sheet>
  )
}

function BudgetSheetBody({
  workspaceId,
  view,
  periodLabel,
  periodOptions,
  onOpenChange,
}: BudgetSheetProps) {
  const save = useSetBudget(workspaceId)
  const [isRemoving, setIsRemoving] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const form = useSchemaForm({
    schema: budgetFormSchema,
    requiredMessages: { amount: copy.required },
    defaultValues: {
      amount: view.limitCents === null ? '' : formatTypedAmount(view.limitCents),
      fromPeriod: periodLabel,
    },
  })

  async function send(limitCents: number | null, fromPeriod: string, toast: string) {
    setProblem(null)
    try {
      await save.mutateAsync({ categoryId: view.categoryAccountId, limitCents, fromPeriod })
      onOpenChange(false)
      showToast(toast, { tone: 'success' })
    } catch (error) {
      setProblem(errorMessageFor(error))
    }
  }

  return (
    <Form
      form={form}
      onSubmit={({ amount, fromPeriod }: BudgetFormInput) =>
        void send(centsOfTypedAmount(amount), fromPeriod, copy.saved(view.name))
      }
      className="flex flex-col gap-4"
    >
      {problem && <Alert tone="danger">{problem}</Alert>}
      <CategoryCard view={view} periodLabel={periodLabel} />
      <Spending view={view} periodLabel={periodLabel} />
      {view.average && (
        <Alert tone="info">
          <RichText
            text={copy.average(
              view.average.periods,
              formatBrl(view.average.amountCents),
              view.name,
              view.childNames.length > 0,
            )}
          />
        </Alert>
      )}
      <FormField<BudgetFormInput> name="amount" label={copy.limit} isRequired>
        {(field) => <MoneyInput size="lg" {...field} />}
      </FormField>
      <FormField<BudgetFormInput>
        name="fromPeriod"
        label={copy.from}
        help={copy.fromHelp}
        isRequired
      >
        {(field) => <Select title={copy.from} options={periodOptions} {...field} />}
      </FormField>
      {view.limitCents !== null && (
        <Button variant="dangerText" className="self-start" onClick={() => setIsRemoving(true)}>
          {copy.remove}
        </Button>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          {copy.cancel}
        </Button>
        <Button type="submit" isLoading={save.isPending}>
          {copy.save}
        </Button>
      </div>
      <ConfirmDialog
        title={copy.removeTitle(view.name, formatMonthLabel(form.getValues('fromPeriod')))}
        description={copy.removeText}
        cancelLabel={copy.cancel}
        confirmLabel={copy.removeConfirm}
        confirmVariant="danger"
        isOpen={isRemoving}
        onOpenChange={setIsRemoving}
        onConfirm={() => {
          setIsRemoving(false)
          void send(null, form.getValues('fromPeriod'), copy.removed(view.name))
        }}
      />
    </Form>
  )
}

function CategoryCard({ view }: BudgetSheetViewProps) {
  const includes =
    view.childNames.length > 0 ? copy.includes(view.childNames.join(copy.and)) : copy.plainCategory
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
      <CategoryArt name={view.art.name} icon={view.art.icon} size="md" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-row font-semibold">{view.name}</span>
        <span className="line-clamp-2 text-row-detail text-ink-muted">{includes}</span>
      </span>
    </div>
  )
}

function Spending({ view, periodLabel }: BudgetSheetViewProps) {
  if (view.spending.length === 0) {
    return null
  }
  return (
    <section
      aria-label={copy.spentIn(formatMonthLabel(periodLabel))}
      className="flex flex-col gap-1.5"
    >
      <p className="text-label font-semibold">{copy.spentIn(formatMonthLabel(periodLabel))}</p>
      <ul className="flex flex-col gap-1 text-body-sm">
        {view.spending.map((line) => (
          <li key={line.label} className="flex items-baseline gap-2">
            <span className="min-w-0 truncate">{line.label}</span>
            <span aria-hidden="true" className="mt-1 min-w-4 flex-1 self-center dotted-leader" />
            <Amount cents={line.amountCents} size="inherit" className="shrink-0" />
          </li>
        ))}
        <li className="flex items-baseline gap-2 border-t border-ink pt-1 font-semibold">
          <span className="flex-1">{copy.total}</span>
          <Amount cents={view.totalCents} size="inherit" className="shrink-0" />
        </li>
      </ul>
    </section>
  )
}

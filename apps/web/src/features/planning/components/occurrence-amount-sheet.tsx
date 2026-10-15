import { formatBrl } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { showToast } from '@web/components/feedback/toast'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { MoneyInput } from '@web/components/inputs/money-input'
import { Sheet } from '@web/components/layout/sheet'
import { useOccurrenceAction } from '@web/features/planning/api/use-occurrence-action'
import { planningMessages } from '@web/features/planning/planning.messages'
import { occurrenceAmountFormSchema } from '@web/features/planning/planning.schemas'
import type {
  OccurrenceAmountFormInput,
  OccurrenceAmountSheetProps,
} from '@web/features/planning/planning.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatWeekdayDayMonth } from '@web/lib/format/calendar'
import { centsOfTypedAmount, formatTypedAmount } from '@web/lib/format/money'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'

const copy = planningMessages.occurrences.amount
const ESTIMATE = '≈ '

export function OccurrenceAmountSheet({
  workspaceId,
  occurrence,
  isOpen,
  onOpenChange,
}: OccurrenceAmountSheetProps) {
  const action = useOccurrenceAction(workspaceId)
  const form = useSchemaForm({
    schema: occurrenceAmountFormSchema,
    requiredMessages: { amount: copy.required },
    defaultValues: { amount: formatTypedAmount(occurrence.amountCents) },
  })

  async function save({ amount }: OccurrenceAmountFormInput) {
    try {
      await action.mutateAsync({
        action: 'amount',
        occurrenceId: occurrence.id,
        amountCents: centsOfTypedAmount(amount) ?? occurrence.amountCents,
      })
      onOpenChange(false)
      showToast(copy.saved, { tone: 'success' })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  const planned = `${occurrence.amountIsEstimate ? ESTIMATE : ''}${formatBrl(occurrence.amountCents)}`
  return (
    <Sheet
      title={copy.title}
      description={copy.description(
        occurrence.description,
        formatWeekdayDayMonth(occurrence.dueOn),
      )}
      closeLabel={copy.cancel}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Form form={form} onSubmit={save} className="flex flex-col gap-4">
        <FormField<OccurrenceAmountFormInput>
          name="amount"
          label={copy.label}
          help={copy.help(planned)}
          isRequired
        >
          {(field) => <MoneyInput size="lg" {...field} />}
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {copy.cancel}
          </Button>
          <Button type="submit" isLoading={action.isPending}>
            {copy.save}
          </Button>
        </div>
      </Form>
    </Sheet>
  )
}

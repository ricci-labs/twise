import { formatBrl, isoDateSchema } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { CategoryArt } from '@web/components/display/category-art'
import { RichText } from '@web/components/display/rich-text'
import { goalPreviewQueryOptions } from '@web/features/planning/api/planning.queries'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { GoalFormValues, GoalPreviewProps } from '@web/features/planning/planning.types'
import { useDebouncedValue } from '@web/hooks/use-debounced-value'
import { formatMonthLabel } from '@web/lib/format/calendar'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { useWatch } from 'react-hook-form'

const messages = planningMessages.goals.form
const MONTH_LABEL_LENGTH = 7
const PREVIEW_DELAY_MS = 300

export function GoalPreview({ workspaceId, accounts }: GoalPreviewProps) {
  const [target, accountId, targetOn] = useWatch<
    GoalFormValues,
    ['target', 'accountId', 'targetOn']
  >({ name: ['target', 'accountId', 'targetOn'] })
  const targetCents = useDebouncedValue(centsOfTypedAmount(target) ?? 0, PREVIEW_DELAY_MS)
  const isReady = targetCents > 0 && accountId !== '' && isoDateSchema.safeParse(targetOn).success
  const preview = useQuery({
    ...goalPreviewQueryOptions(workspaceId, { targetCents, accountId, targetOn }),
    enabled: isReady,
  })
  if (!isReady || !preview.data) {
    return null
  }
  const account = accounts.find((candidate) => candidate.id === accountId)
  return (
    <div
      data-slot="goal-preview"
      className="flex items-start gap-3 rounded-lg bg-sunken px-4 py-3.5 text-body-sm text-ink lg:col-span-2"
      aria-live="polite"
    >
      <CategoryArt name={messages.targetOn} icon="calendar" size="md" />
      <p className="whitespace-pre-line">
        <RichText
          text={messages.preview(
            formatMonthLabel(targetOn.slice(0, MONTH_LABEL_LENGTH)),
            formatBrl(preview.data.monthlyToTargetCents),
            formatBrl(preview.data.savedCents),
            account?.name ?? '',
          )}
        />
      </p>
    </div>
  )
}

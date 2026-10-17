import { cva } from 'class-variance-authority'

export const chargePreviewVariants = cva(
  'flex flex-col gap-2.5 rounded-lg border border-border bg-surface px-4 py-3.5',
)

export const chargePreviewHeadingVariants = cva('m-0 text-note font-emphasis text-ink-muted')

export const chargePreviewListVariants = cva('m-0 flex list-none flex-col gap-2 p-0')

export const chargePreviewRowVariants = cva('flex items-center gap-2 text-body-sm text-ink', {
  variants: {
    isTotal: {
      true: 'border-t border-border pt-2.5 font-emphasis',
      false: '',
    },
  },
  defaultVariants: { isTotal: false },
})

export const chargePreviewItemTextVariants = cva('flex min-w-0 flex-col')

export const chargePreviewDescriptionVariants = cva('line-clamp-2 font-semibold break-words')

export const chargePreviewDueVariants = cva('text-row-detail text-ink-muted')

export const chargePreviewLeaderVariants = cva('mt-1 min-w-4 flex-1 self-center dotted-leader')

export const chargePreviewAmountVariants = cva('shrink-0 font-emphasis')

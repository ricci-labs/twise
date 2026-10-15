import { cva } from 'class-variance-authority'

export const installmentRowsVariants = cva('m-0 list-none p-0')

export const installmentRowVariants = cva('border-border not-first:border-t')

export const installmentRowMainVariants = cva(
  'flex min-h-13 items-center gap-2.5 text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-ink-muted',
)

export const installmentNumberVariants = cva(
  'min-w-9 shrink-0 text-note font-emphasis text-ink-muted tabular-nums',
)

export const installmentTextVariants = cva('flex min-w-0 flex-1 flex-col')

export const installmentMonthVariants = cva('text-body-sm font-semibold')

export const installmentDueVariants = cva('text-caption text-ink-muted')

export const installmentAmountVariants = cva(
  'text-body-sm font-emphasis whitespace-nowrap tabular-nums',
)

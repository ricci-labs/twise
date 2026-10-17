import { cva } from 'class-variance-authority'

export const openItemRowVariants = cva('flex border-border not-first:border-t')

export const openItemRowMainVariants = cva(
  'flex min-h-16 min-w-0 flex-1 items-center gap-3 py-2.5 text-start text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
)

export const openItemRowTextVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5')

export const openItemRowTitleVariants = cva('line-clamp-2 text-row font-semibold break-words')

export const openItemRowDetailVariants = cva(
  'line-clamp-2 text-row-detail break-words text-ink-muted [&>[data-slot=badge]]:me-1.5 [&>[data-slot=badge]]:align-text-bottom',
)

export const openItemRowAmountVariants = cva(
  'shrink-0 text-row font-emphasis whitespace-nowrap text-ink',
)

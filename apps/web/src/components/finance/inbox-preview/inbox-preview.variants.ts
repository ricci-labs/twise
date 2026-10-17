import { cva } from 'class-variance-authority'

export const inboxPreviewVariants = cva(
  'flex min-w-0 flex-col gap-px rounded-md bg-page px-3 py-2.5 text-ink',
)

export const inboxPreviewHeadVariants = cva('flex items-baseline justify-between gap-2')

export const inboxPreviewSenderVariants = cva('m-0 truncate text-label font-emphasis')

export const inboxPreviewTimeVariants = cva('shrink-0 text-fine text-ink-muted')

export const inboxPreviewSubjectVariants = cva('m-0 truncate text-label font-emphasis')

export const inboxPreviewPreheaderVariants = cva('m-0 truncate text-note text-ink-muted')

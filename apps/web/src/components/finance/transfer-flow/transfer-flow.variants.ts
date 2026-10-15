import { cva } from 'class-variance-authority'

export const transferFlowVariants = cva(
  'flex items-center gap-2 [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-ink-muted',
)

export const transferBoxVariants = cva(
  'flex flex-1 flex-col items-start gap-0.5 rounded-md bg-page p-3 [&>[data-slot=category-art]]:mb-1',
)

export const transferLabelVariants = cva('text-caption text-ink-muted')

export const transferNameVariants = cva('text-choice font-emphasis text-ink')

export const transferNoteVariants = cva('mt-2.5 text-note text-ink-muted')

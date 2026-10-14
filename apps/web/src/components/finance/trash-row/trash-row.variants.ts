import { cva } from 'class-variance-authority'

export const trashRowVariants = cva(
  'flex items-center gap-2.5 border-border py-3 not-first:border-t',
)

export const trashRowMainVariants = cva(
  'flex min-w-0 flex-1 items-start gap-3 [&>[data-slot=category-art]]:-m-0.5',
)

export const trashRowTextVariants = cva(
  'flex min-w-0 flex-1 flex-col gap-0.5 text-row-detail text-ink-muted',
)

export const trashRowNameVariants = cva('text-row text-ink')

export const trashRowNoteVariants = cva('text-ink')

import { cva } from 'class-variance-authority'

export const accountGroupVariants = cva('flex flex-col gap-1.5')

export const accountGroupHeadVariants = cva('flex min-h-7 items-center justify-between gap-3')

export const accountGroupTitleVariants = cva('font-display text-section-title')

export const accountGroupAddVariants = cva(
  'inline-flex items-center gap-1 text-label [&_svg]:size-4 [&_svg]:no-underline',
)

export const accountGroupListVariants = cva(
  'flex flex-col rounded-lg border border-border bg-surface px-3 py-1',
)

export const accountGroupNoteVariants = cva('mx-0.5 mt-1 text-caption font-normal text-ink-muted')

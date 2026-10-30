import { cva } from 'class-variance-authority'

export const memberRowVariants = cva('flex items-start gap-3 border-border py-3 not-first:border-t')

export const memberRowTextVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5')

export const memberRowNameVariants = cva('flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1')

export const memberRowTitleVariants = cva('line-clamp-2 text-row font-semibold break-words')

export const memberRowEmailVariants = cva(
  'line-clamp-2 text-row-detail wrap-anywhere text-ink-muted',
)

export const memberRowMetaVariants = cva(
  'mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-row-detail text-ink-muted',
)

export const memberRowActionsVariants = cva('-mr-2 shrink-0')

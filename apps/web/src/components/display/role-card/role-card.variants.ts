import { cva } from 'class-variance-authority'

export const roleCardVariants = cva(
  'flex items-start gap-3 border-border py-3.5 not-first:border-t',
)

export const roleCardTextVariants = cva('flex min-w-0 flex-1 flex-col gap-1')

export const roleCardNameVariants = cva('line-clamp-2 text-row font-semibold break-words')

export const roleCardMetaVariants = cva(
  'flex flex-wrap items-center gap-x-2 gap-y-1 text-row-detail text-ink-muted',
)

export const roleCardDescriptionVariants = cva('text-body-sm text-ink')

export const roleCardLockVariants = cva('flex items-center gap-1.5 text-note text-ink-muted')

export const roleCardActionsVariants = cva('-mr-2 shrink-0')

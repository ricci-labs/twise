import { cva } from 'class-variance-authority'

export const invitationRowVariants = cva(
  'flex items-start gap-3 border-border py-3 not-first:border-t',
)

export const invitationRowIconVariants = cva(
  'grid size-9 shrink-0 place-items-center rounded-md bg-sunken text-ink [&>svg]:size-4.5',
)

export const invitationRowTextVariants = cva('flex min-w-0 flex-1 flex-col gap-1')

export const invitationRowContactVariants = cva('line-clamp-2 text-row font-semibold wrap-anywhere')

export const invitationRowMetaVariants = cva(
  'flex flex-wrap items-center gap-x-2 gap-y-1 text-row-detail text-ink-muted',
)

export const invitationRowDetailVariants = cva('text-row-detail text-ink-muted')

export const invitationRowActionsVariants = cva('-mr-2 shrink-0')

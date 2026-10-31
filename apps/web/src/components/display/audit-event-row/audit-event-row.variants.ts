import { cva } from 'class-variance-authority'

export const auditEventRowVariants = cva('border-border not-first:border-t')

export const auditEventRowMainVariants = cva(
  'relative flex items-start gap-3 py-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring aria-current:-mx-4 aria-current:bg-sunken aria-current:px-4 aria-current:before:absolute aria-current:before:inset-y-0 aria-current:before:left-0 aria-current:before:w-0.75 aria-current:before:bg-ink',
)

export const auditEventRowSystemVariants = cva(
  'inline-grid size-9 shrink-0 place-items-center rounded-full bg-sunken text-ink [&>svg]:size-4',
)

export const auditEventRowTextVariants = cva('flex min-w-0 flex-1 flex-col gap-0.75')

export const auditEventRowSentenceVariants = cva(
  'line-clamp-3 text-body-sm break-words [&>strong]:font-emphasis',
)

export const auditEventRowDetailVariants = cva(
  'line-clamp-2 text-row-detail break-words text-ink-muted',
)

export const auditEventRowBadgeVariants = cva(
  'mr-1.5 inline-flex h-5 items-center align-bottom gap-1 rounded-full bg-sunken px-2 text-caption font-semibold text-ink-muted [&>svg]:size-3',
)

export const auditEventRowChevronVariants = cva('mt-2 size-4 shrink-0 text-ink-muted')

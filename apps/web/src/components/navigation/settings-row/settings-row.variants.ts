import { cva } from 'class-variance-authority'

export const settingsRowVariants = cva('flex border-border not-first:border-t')

export const settingsRowLinkVariants = cva(
  'flex min-h-16 min-w-0 flex-1 items-center gap-3 py-2.5 text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&>[data-slot=category-art]]:-my-0.5 [&>[data-slot=category-art]]:-ml-0.5',
)

export const settingsRowTextVariants = cva('flex min-w-0 flex-1 flex-col gap-px')

export const settingsRowTitleVariants = cva('line-clamp-2 text-row font-semibold break-words')

export const settingsRowDetailVariants = cva(
  'line-clamp-2 text-row-detail break-words text-ink-muted',
)

export const settingsRowChevronVariants = cva('size-5 shrink-0 text-ink-muted')

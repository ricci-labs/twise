import { cva } from 'class-variance-authority'

export const cardBlockVariants = cva(
  'flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-surface p-4 [&>:last-child]:mt-auto',
)

export const cardBlockHeadVariants = cva('flex items-center gap-1.5')

export const cardBlockNameLinkVariants = cva(
  'flex min-w-0 flex-1 items-center gap-3 rounded-md text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&>[data-slot=category-art]]:-m-0.75',
)

export const cardBlockNameTextVariants = cva('flex min-w-0 flex-col gap-0.5')

export const cardBlockNameVariants = cva(
  'flex min-w-0 items-center gap-2 font-display text-section-title [&>span:first-child]:line-clamp-2 [&>span:first-child]:break-words',
)

export const cardBlockCycleVariants = cva('line-clamp-2 text-row-detail break-words text-ink-muted')

export const cardBlockInvoiceVariants = cva(
  'flex items-center gap-2.5 rounded-lg bg-page px-3.5 py-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-ink-muted',
)

export const cardBlockInvoiceLabelVariants = cva('line-clamp-2 min-w-0 flex-1 text-label')

export const cardBlockInvoiceValueVariants = cva('flex shrink-0 flex-col items-end')

export const cardBlockAmountVariants = cva('font-display text-amount-card tabular-nums')

export const cardBlockFineVariants = cva('text-fine text-ink-muted')

export const cardBlockLimitVariants = cva('flex flex-col gap-1.5')

export const cardBlockLimitHeadVariants = cva(
  'flex flex-wrap justify-between gap-x-3 text-chip text-ink-muted [&>b]:font-emphasis [&>b]:text-ink',
)

export const cardBlockBestVariants = cva(
  'flex items-center gap-1.5 border-t-stroke border-dashed border-border pt-2.5 text-chip font-normal text-ink-muted [&_b]:text-ink [&>svg]:text-mint-ink',
)

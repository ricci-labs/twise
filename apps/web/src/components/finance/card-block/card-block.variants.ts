import { cva } from 'class-variance-authority'

export const cardBlockVariants = cva(
  'flex flex-col gap-3 rounded-xl border border-border bg-surface p-4',
)

export const cardBlockHeadVariants = cva('flex items-center gap-1.5')

export const cardBlockNameLinkVariants = cva(
  'flex min-w-0 flex-1 items-center gap-3 rounded-md text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&>[data-slot=category-art]]:-m-0.75',
)

export const cardBlockNameVariants = cva(
  'flex min-w-0 items-center gap-2 font-display text-section-title [&>span:first-child]:truncate',
)

export const cardBlockCycleVariants = cva('text-row-detail text-ink-muted')

export const cardBlockInvoiceVariants = cva(
  'flex items-center gap-2.5 rounded-lg bg-page px-3.5 py-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-ink-muted',
)

export const cardBlockInvoiceLabelVariants = cva('flex-1 text-label whitespace-nowrap')

export const cardBlockInvoiceValueVariants = cva('flex flex-col items-end')

export const cardBlockAmountVariants = cva('font-display text-amount-card tabular-nums')

export const cardBlockFineVariants = cva('text-fine text-ink-muted')

export const cardBlockLimitVariants = cva('flex flex-col gap-1.5')

export const cardBlockLimitHeadVariants = cva(
  'flex justify-between text-chip text-ink-muted [&>b]:font-emphasis [&>b]:text-ink',
)

export const cardBlockBestVariants = cva(
  'flex items-center gap-1.5 border-t-stroke border-dashed border-border pt-2.5 text-chip font-normal text-ink-muted [&_b]:text-ink [&>svg]:text-mint-ink',
)

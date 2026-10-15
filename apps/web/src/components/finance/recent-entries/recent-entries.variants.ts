import { cva } from 'class-variance-authority'

export const recentEntriesVariants = cva('flex flex-col gap-2')

export const recentEntriesTitleVariants = cva('px-4 text-note font-semibold text-ink-muted lg:px-0')

export const recentEntriesRowVariants = cva(
  'flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 scrollbar-none lg:scroll-px-0 lg:px-0 [&>li]:shrink-0',
)

export const recentEntryVariants = cva([
  'flex min-h-14 max-w-64 shrink-0 cursor-pointer snap-start items-center gap-2.5 rounded-lg border border-border bg-surface py-2 pr-3.5 pl-2 text-left text-label text-ink outline-none',
  'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset [&>[data-slot=category-art]]:-m-0.75',
  'aria-pressed:border-ink aria-pressed:ring-1 aria-pressed:ring-ink aria-pressed:ring-inset',
])

export const recentEntryTextVariants = cva('flex min-w-0 flex-col')

export const recentEntryNameVariants = cva('line-clamp-2 break-words')

export const recentEntryAmountVariants = cva('text-note font-normal text-ink-muted tabular-nums')

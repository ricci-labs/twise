import { cva } from 'class-variance-authority'

export const recentEntriesVariants = cva('flex flex-col gap-2')

export const recentEntriesTitleVariants = cva('px-4 text-note font-semibold text-ink-muted lg:px-0')

export const recentEntriesRowVariants = cva(
  'flex snap-x gap-2 overflow-x-auto px-4 pb-1 scrollbar-none lg:px-0 [&>li]:shrink-0',
)

export const recentEntryVariants = cva([
  'flex min-h-14 shrink-0 cursor-pointer snap-start items-center gap-2.5 rounded-lg border border-border bg-surface py-2 pr-3.5 pl-2 text-left text-label text-ink outline-none',
  'focus-visible:ring-2 focus-visible:ring-focus-ring [&>[data-slot=category-art]]:-m-0.75',
  'aria-pressed:border-ink aria-pressed:ring-1 aria-pressed:ring-ink aria-pressed:ring-inset',
])

export const recentEntryTextVariants = cva('flex flex-col whitespace-nowrap')

export const recentEntryAmountVariants = cva('text-note font-normal text-ink-muted tabular-nums')

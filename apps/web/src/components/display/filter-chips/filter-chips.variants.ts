import { cva } from 'class-variance-authority'

export const filterChipsVariants = cva(
  'm-0 flex min-w-0 flex-wrap items-center gap-1.5 border-0 p-0',
)

export const filterChipVariants = cva(
  'inline-flex h-8 cursor-pointer items-center gap-1 rounded-full bg-surface pr-2 pl-3 text-label text-ink inset-stroke outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 [&>svg]:size-3.75 [&>svg]:shrink-0',
)

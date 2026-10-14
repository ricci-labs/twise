import { cva } from 'class-variance-authority'

export const radioCardListVariants = cva('flex flex-col gap-2')

export const radioCardVariants = cva([
  'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-md border border-border-control bg-surface px-3 py-2 text-left text-body-sm font-semibold text-ink outline-none',
  'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  'data-checked:border-ink data-checked:ring-1 data-checked:ring-ink data-checked:ring-inset',
])

export const radioDotVariants = cva(
  'grid size-5 shrink-0 place-items-center rounded-full border-2 border-border-control bg-surface in-data-checked:border-6 in-data-checked:border-ink',
)

export const radioCardTextVariants = cva('flex min-w-0 flex-1 flex-col')

export const radioCardDetailVariants = cva(
  'text-caption font-normal text-ink-muted [&_strong]:font-emphasis [&_strong]:text-ink [&_strong]:tabular-nums',
)

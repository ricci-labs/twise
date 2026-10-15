import { cva } from 'class-variance-authority'

export const radioCardListVariants = cva('gap-2', {
  variants: {
    layout: {
      stack: 'flex flex-col',
      pair: 'grid grid-cols-2',
    },
  },
  defaultVariants: { layout: 'stack' },
})

export const radioCardVariants = cva(
  [
    'flex w-full cursor-pointer gap-3 rounded-md border border-border-control bg-surface px-3 text-left text-ink outline-none',
    'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
    'data-checked:border-ink data-checked:ring-1 data-checked:ring-ink data-checked:ring-inset',
  ],
  {
    variants: {
      layout: {
        stack: 'min-h-14 items-center py-2 text-choice font-semibold',
        pair: 'items-start gap-2.5 py-3 text-choice font-emphasis [&>[data-slot=radio-dot]]:mt-px',
      },
    },
    defaultVariants: { layout: 'stack' },
  },
)

export const radioDotVariants = cva(
  'grid size-5 shrink-0 place-items-center rounded-full border-2 border-border-control bg-surface in-data-checked:border-6 in-data-checked:border-ink',
)

export const radioCardTextVariants = cva('flex min-w-0 flex-1 flex-col')

export const radioCardDetailVariants = cva(
  'text-note font-normal text-ink-muted [&_strong]:font-emphasis [&_strong]:text-ink [&_strong]:tabular-nums',
)

export const radioCardListBoxVariants = cva('flex flex-col gap-2')

export const radioCardListEmptyVariants = cva('px-1 text-note font-medium text-ink-muted')

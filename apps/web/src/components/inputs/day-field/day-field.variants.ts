import { cva } from 'class-variance-authority'

export const dayFieldVariants = cva(
  [
    'flex cursor-pointer items-center border border-border-control bg-surface text-left text-ink outline-none',
    'focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink',
    'aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger',
    '[&>svg]:shrink-0 [&>svg]:text-ink-muted',
  ],
  {
    variants: {
      size: {
        field: 'min-h-control w-full gap-2 rounded-md pr-3 pl-4 text-body [&>svg]:size-4',
        inline:
          'h-8.5 min-w-13 gap-0.5 rounded-sm pr-1.5 pl-2.5 font-emphasis tabular-nums [&>svg]:size-3.5',
      },
    },
    defaultVariants: { size: 'field' },
  },
)

export const dayGridVariants = cva('grid grid-cols-7 justify-items-center gap-x-1 gap-y-1.5 px-1')

export const dayVariants = cva([
  'relative grid size-10.5 cursor-pointer place-items-center rounded-full text-body leading-none font-medium text-ink tabular-nums outline-none',
  'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring',
  'data-checked:bg-surface data-checked:font-heavy data-checked:inset-ring-2 data-checked:inset-ring-ink',
])

export const dayDotVariants = cva('size-1 shrink-0 rounded-full bg-ink-subtle')

export const dayShortDotVariants = cva(
  'absolute bottom-1.25 left-1/2 -ml-0.5 size-1 rounded-full bg-ink-subtle',
)

export const dayNoteVariants = cva('mt-1 flex items-center gap-2 px-1 text-note text-ink-muted')

export const daySummaryVariants = cva(
  'mx-1 mt-1.5 mb-1.5 flex items-center gap-2 rounded-md bg-page px-3.5 py-3 text-confirm text-ink [&>svg]:size-4 [&>svg]:text-mint-ink',
)

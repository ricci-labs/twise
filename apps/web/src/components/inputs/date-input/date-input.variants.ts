import { cva } from 'class-variance-authority'

export const dateInputVariants = cva([
  'flex min-h-control w-full cursor-pointer items-center gap-2.5 rounded-md border border-border-control bg-surface pr-3 pl-4 text-left text-body text-ink outline-none',
  'focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink',
  'aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger',
  '[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-ink-muted',
])

export const dateInputValueVariants = cva('min-w-0 flex-1 tabular-nums', {
  variants: {
    isEmpty: {
      true: 'text-ink-subtle',
      false: '',
    },
  },
  defaultVariants: { isEmpty: false },
})

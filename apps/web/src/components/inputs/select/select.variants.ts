import { cva } from 'class-variance-authority'

export const selectVariants = cva(
  [
    'relative flex cursor-pointer items-center border border-border-control bg-surface text-left text-ink outline-none',
    'focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink',
    'aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger',
    'disabled:cursor-not-allowed disabled:text-ink-muted',
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

export const selectValueVariants = cva('min-w-0 flex-1 truncate', {
  variants: {
    isEmpty: {
      true: 'text-ink-subtle',
      false: '',
    },
  },
  defaultVariants: { isEmpty: false },
})

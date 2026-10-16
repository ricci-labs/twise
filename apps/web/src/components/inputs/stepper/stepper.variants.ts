import { cva } from 'class-variance-authority'

export const stepperRowVariants = cva('flex flex-wrap items-center gap-3.5', {
  variants: {
    size: {
      md: '',
      sm: 'gap-2.5',
    },
  },
  defaultVariants: { size: 'md' },
})

export const stepperVariants = cva(
  'inline-flex items-center overflow-hidden rounded-full border border-border-control bg-surface',
)

export const stepperButtonVariants = cva(
  [
    'grid w-11 cursor-pointer place-items-center text-title text-ink outline-none',
    'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset',
    'disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:bg-surface',
  ],
  {
    variants: {
      size: {
        md: 'h-11.5',
        sm: 'h-11',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export const stepperValueVariants = cva('text-center text-title-sm font-bold tabular-nums', {
  variants: {
    size: {
      md: 'min-w-19',
      sm: 'min-w-14',
    },
  },
  defaultVariants: { size: 'md' },
})

export const stepperAsideVariants = cva(
  '[&_strong]:font-emphasis [&_strong]:text-ink [&_strong]:tabular-nums',
  {
    variants: {
      size: {
        md: 'text-body-sm text-ink-muted',
        sm: 'text-choice text-ink',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

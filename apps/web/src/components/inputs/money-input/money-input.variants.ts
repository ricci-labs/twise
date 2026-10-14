import { cva } from 'class-variance-authority'

export const moneyBoxVariants = cva(
  [
    'flex items-center gap-1.5 rounded-md border border-border-control bg-surface px-4',
    'focus-within:border-ink focus-within:ring-1 focus-within:ring-ink',
    'has-[input[aria-invalid=true]]:border-danger has-[input[aria-invalid=true]]:ring-1 has-[input[aria-invalid=true]]:ring-danger',
    'has-[input:read-only]:border-border has-[input:read-only]:bg-sunken has-[input:read-only]:ring-0',
    'has-[input:disabled]:border-border has-[input:disabled]:bg-sunken',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-control-sm gap-1 px-3',
        md: 'min-h-14',
        lg: 'min-h-16',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export const moneyAffixVariants = cva('shrink-0 font-semibold', {
  variants: {
    size: {
      sm: 'text-body-sm',
      md: 'text-body',
      lg: 'text-title',
    },
    isNegative: {
      true: 'text-danger',
      false: 'text-ink-muted',
    },
  },
  defaultVariants: { size: 'md', isNegative: false },
})

export const moneyValueVariants = cva(
  [
    'w-full min-w-0 flex-1 bg-transparent tabular-nums outline-none placeholder:text-ink-subtle',
    'read-only:text-ink-muted disabled:text-ink-muted',
  ],
  {
    variants: {
      size: {
        sm: 'text-right text-amount',
        md: 'text-amount-lg',
        lg: 'font-display text-display',
      },
      isNegative: {
        true: 'text-danger',
        false: 'text-ink',
      },
    },
    defaultVariants: { size: 'md', isNegative: false },
  },
)

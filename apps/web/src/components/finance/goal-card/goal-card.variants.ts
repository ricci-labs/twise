import { cva } from 'class-variance-authority'

export const goalCardVariants = cva(
  'flex h-full flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3.5',
)

export const goalCardTopVariants = cva('flex items-start gap-3')

export const goalCardNameBoxVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5')

export const goalCardNameVariants = cva(
  'line-clamp-2 text-title-sm font-emphasis break-words text-ink',
)

export const goalCardAccountVariants = cva('line-clamp-2 text-note break-words text-ink-muted')

export const goalCardBadgeVariants = cva('me-1.5 align-middle')

export const goalCardActionsVariants = cva('-me-2 -mt-1.5 shrink-0')

export const goalCardAmountVariants = cva(
  'flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums',
)

export const goalCardSavedVariants = cva('font-display text-amount-card whitespace-nowrap text-ink')

export const goalCardTargetVariants = cva(
  'text-body-sm font-medium whitespace-nowrap text-ink-muted',
)

export const goalCardFootVariants = cva(
  'flex flex-wrap justify-between gap-x-2.5 gap-y-0.5 text-note font-medium text-ink-muted tabular-nums',
)

export const goalCardFootEndVariants = cva('ms-auto whitespace-nowrap')

export const goalCardHintVariants = cva(
  'mt-auto flex items-start gap-2 rounded-md px-3 py-2.5 text-note text-ink [&_strong]:whitespace-nowrap [&>svg]:mt-0.5 [&>svg]:shrink-0',
  {
    variants: {
      isReached: {
        false: 'bg-page [&>svg]:text-ink-muted',
        true: 'bg-mint-soft [&>svg]:text-mint-ink',
      },
    },
    defaultVariants: { isReached: false },
  },
)

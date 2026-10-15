import { cva } from 'class-variance-authority'

export const entryRowVariants = cva('border-border not-first:border-t')

export const entryRowMainVariants = cva(
  'flex min-h-16 items-center gap-3 py-2.5 text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
)

export const entryRowTextVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5')

export const entryRowTitleVariants = cva('flex min-w-0 items-center gap-x-1.5 text-row')

export const entryRowTitleTextVariants = cva('line-clamp-2 min-w-0 break-words')

export const entryRowMatchVariants = cva('rounded-swatch bg-mint-soft px-px text-inherit')

export const entryRowBadgeVariants = cva(
  'inline-grid h-5 shrink-0 place-items-center rounded-sm bg-sunken px-1.5 text-caption font-emphasis text-ink-muted tabular-nums',
)

export const entryRowMarkVariants = cva(
  'inline-grid size-5 shrink-0 place-items-center text-ink-muted [&>svg]:size-3.75',
)

export const entryRowDetailVariants = cva('line-clamp-2 text-row-detail break-words text-ink-muted')

export const entryRowAmountVariants = cva('shrink-0 text-row font-emphasis', {
  variants: {
    direction: {
      out: 'text-ink',
      in: 'text-mint-ink',
      neutral: 'font-semibold text-ink-muted',
    },
  },
  defaultVariants: { direction: 'out' },
})

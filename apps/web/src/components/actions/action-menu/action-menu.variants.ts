import { cva } from 'class-variance-authority'

export const actionMenuPopupVariants = cva(
  'z-overlay flex min-w-60 flex-col rounded-md border border-border bg-surface p-1.5 shadow-dialog outline-none',
)

export const actionMenuItemVariants = cva(
  [
    'flex min-h-10 cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-body-sm font-medium outline-none select-none data-highlighted:bg-page aria-[current=true]:font-semibold',
    '[&_[data-slot=icon]]:size-4.5',
  ],
  {
    variants: {
      tone: {
        neutral: 'text-ink [&_[data-slot=icon]]:text-ink-muted',
        danger: 'text-danger [&_[data-slot=icon]]:text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export const actionMenuSeparatorVariants = cva('my-1 h-px bg-border')

export const actionMenuHeaderVariants = cva('px-3 pt-1.5 pb-1 text-caption text-ink-muted')

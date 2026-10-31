import { cva } from 'class-variance-authority'

export const workScreenVariants = cva(
  'grid flex-1 grid-cols-work-screen items-start gap-5 tall:min-h-0 tall:items-stretch',
)

export const workScreenPaneVariants = cva(
  'flex flex-col rounded-xl border border-border bg-surface outline-none focus-visible:ring-2 focus-visible:ring-focus-ring tall:min-h-0 tall:overflow-y-auto',
  {
    variants: {
      side: {
        list: '',
        detail: 'sticky top-6 tall:static',
      },
    },
  },
)

export const workScreenHeaderVariants = cva(
  'sticky top-0 z-sticky flex min-h-17 shrink-0 items-center gap-3 rounded-t-xl border-b border-border bg-surface px-5 py-3',
)

export const workScreenBodyVariants = cva('flex flex-col px-5 py-4')

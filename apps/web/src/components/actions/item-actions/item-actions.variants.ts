import { cva } from 'class-variance-authority'

export const itemActionsTriggerVariants = cva(
  'grid size-control-sm shrink-0 cursor-pointer place-items-center rounded-full text-ink-muted outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-4',
)

export const actionSheetListVariants = cva('-mx-2 flex flex-col')

export const actionSheetRowVariants = cva(
  [
    'flex min-h-13 w-full cursor-pointer items-center gap-3.5 rounded-md px-3 text-left text-body font-medium outline-none',
    'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring',
    '[&_[data-slot=icon]]:size-5.5',
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

export const actionSheetToggleVariants = cva(
  'flex min-h-13 items-center gap-3.5 px-3 py-1.5 text-body font-medium text-ink [&_[data-slot=switch]_p]:text-caption [&>[data-slot=icon]]:size-5.5 [&>[data-slot=icon]]:text-ink-muted',
)

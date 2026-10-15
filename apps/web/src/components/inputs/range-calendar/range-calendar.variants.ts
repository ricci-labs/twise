import { cva } from 'class-variance-authority'

export const rangeCalendarVariants = cva('flex flex-col gap-3')

export const rangeEndsVariants = cva('flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0')

export const rangeEndVariants = cva(
  'flex min-h-13 flex-1 flex-col justify-center rounded-md px-3',
  {
    variants: {
      isNext: {
        true: 'bg-surface inset-ring-2 inset-ring-ink',
        false: 'bg-sunken',
      },
    },
    defaultVariants: { isNext: false },
  },
)

export const rangeEndLabelVariants = cva('text-caption text-ink-muted')

export const rangeEndValueVariants = cva('text-choice font-emphasis text-ink', {
  variants: {
    isEmpty: {
      true: 'font-medium text-ink-muted',
      false: '',
    },
  },
  defaultVariants: { isEmpty: false },
})

export const rangeHintVariants = cva('text-note text-ink-muted')

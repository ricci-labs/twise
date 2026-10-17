import { cva } from 'class-variance-authority'

export const chargeBodyVariants = cva('flex flex-col gap-3')

export const chargeHistoryVariants = cva(
  'm-0 flex items-start gap-2 rounded-md px-3 py-2.5 text-note text-ink [&_b]:font-emphasis [&_b]:wrap-anywhere [&>svg]:mt-px [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      tone: {
        neutral: 'bg-page [&>svg]:text-ink-muted',
        danger: 'bg-danger-soft [&>svg]:text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export const chargeItemsVariants = cva('m-0 flex list-none flex-col gap-2 p-0')

export const chargeItemVariants = cva('flex items-center gap-2 text-body-sm font-medium', {
  variants: {
    isTotal: {
      true: 'border-t border-border pt-2.5 font-emphasis',
      false: '',
    },
  },
  defaultVariants: { isTotal: false },
})

export const chargeItemTextVariants = cva('line-clamp-2 min-w-0 break-words')

export const chargeItemLeaderVariants = cva('mt-1 min-w-4 flex-1 self-center dotted-leader')

export const chargeItemAmountVariants = cva('shrink-0 font-emphasis')

export const chargeMessageVariants = cva(
  'group [&>summary]:mb-2 [&>summary]:cursor-pointer [&>summary]:text-label [&>summary]:font-emphasis [&>summary]:text-ink',
)

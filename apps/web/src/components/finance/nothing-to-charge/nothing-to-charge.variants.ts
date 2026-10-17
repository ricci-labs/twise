import { cva } from 'class-variance-authority'

export const nothingToChargeVariants = cva('flex items-start gap-3 rounded-lg bg-page p-3.5')

export const nothingToChargeBodyVariants = cva('flex min-w-0 flex-col items-start')

export const nothingToChargeTitleVariants = cva('m-0 text-row font-emphasis text-ink')

export const nothingToChargeTextVariants = cva('m-0 mt-0.5 text-note text-ink-muted', {
  variants: {
    hasAction: {
      true: 'mb-2.5',
      false: '',
    },
  },
  defaultVariants: { hasAction: false },
})

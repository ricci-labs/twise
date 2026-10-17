import { cva } from 'class-variance-authority'

export const chargeRowVariants = cva('border-border not-first:border-t')

export const chargeRowHeadVariants = cva('flex items-start')

export const chargeRowToggleVariants = cva([
  'flex min-w-0 flex-1 cursor-pointer flex-col gap-1 rounded-sm py-3.5 text-left text-ink outline-none',
  'focus-visible:ring-2 focus-visible:ring-focus-ring',
])

export const chargeRowLineVariants = cva('flex min-w-0 items-center gap-2.5')

export const chargeRowTitleVariants = cva('min-w-0 flex-1 truncate text-row')

export const chargeRowAmountVariants = cva('shrink-0 text-row font-emphasis')

export const chargeRowChevronVariants = cva(
  'size-4 shrink-0 text-ink-muted transition-transform duration-select',
  {
    variants: {
      isOpen: { true: 'rotate-180', false: '' },
    },
    defaultVariants: { isOpen: false },
  },
)

export const chargeRowDetailVariants = cva(
  'line-clamp-2 text-note break-words text-ink-muted [&>[data-slot=badge]]:me-1.5 [&>[data-slot=badge]]:align-text-bottom',
)

export const chargeRowMenuVariants = cva('-mr-1.5 ml-0.5 shrink-0 pt-2.5')

export const chargeRowBodyVariants = cva('pb-4')

import { cva } from 'class-variance-authority'

export const invoiceYearHeadVariants = cva('flex items-center justify-between pl-1')

export const invoiceYearLabelVariants = cva('font-display text-section-title')

export const invoiceYearArrowVariants = cva(
  'grid size-touch cursor-pointer place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:text-ink-subtle [&_svg]:size-5',
)

export const invoiceYearGridVariants = cva('grid grid-cols-3 gap-2')

export const invoiceYearMonthVariants = cva([
  'flex flex-col items-start gap-1 rounded-md bg-page px-3 py-2.5 text-ink outline-none',
  'focus-visible:ring-2 focus-visible:ring-focus-ring aria-[current=true]:inset-ring-2 aria-[current=true]:inset-ring-ink',
])

export const invoiceYearMonthNameVariants = cva('text-choice font-bold')

export const invoiceYearMonthTotalVariants = cva(
  'text-fine font-medium text-ink-muted tabular-nums',
)

export const invoiceYearNoteVariants = cva('pl-1 text-note text-ink-muted')

import { cva } from 'class-variance-authority'

export const sheetBackdropVariants = cva(
  'fixed inset-0 z-modal bg-ink/40 transition-opacity duration-normal data-ending-style:opacity-0 data-starting-style:opacity-0',
)

export const sheetPopupVariants = cva(
  'fixed inset-x-0 bottom-0 z-modal flex max-h-sheet flex-col gap-2 overflow-y-auto rounded-t-xl bg-surface px-4 pt-2 pb-safe shadow-dialog outline-none transition-transform duration-sheet ease-out data-ending-style:translate-y-full data-ending-style:duration-normal data-starting-style:translate-y-full',
)

export const sheetHandleVariants = cva('mx-auto mb-1 h-1 w-10 rounded-full bg-border')

export const sheetHeadVariants = cva('flex items-center justify-between gap-2 pl-1')

export const sheetTitleBlockVariants = cva('flex min-w-0 flex-col')

export const sheetDescriptionVariants = cva('mt-0.5 text-note font-medium text-ink-muted')

export const sheetTitleVariants = cva('', {
  variants: {
    hasClose: {
      true: 'font-display text-title',
      false: 'text-title-sm',
    },
  },
  defaultVariants: { hasClose: false },
})

export const sheetCloseVariants = cva(
  '-mr-2 grid size-touch cursor-pointer place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-5',
)

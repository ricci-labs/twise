import { cva } from 'class-variance-authority'

export const momentSheetBackdropVariants = cva(
  'fixed inset-0 z-modal bg-ink/40 transition-opacity duration-normal data-ending-style:opacity-0 data-starting-style:opacity-0',
)

export const momentSheetPopupVariants = cva(
  'fixed inset-x-0 bottom-0 z-modal flex max-h-sheet flex-col items-center gap-2 overflow-y-auto rounded-t-xl bg-surface px-6 pt-2 pb-safe-md text-center shadow-dialog outline-none transition-transform duration-sheet ease-out data-ending-style:translate-y-full data-ending-style:duration-normal data-starting-style:translate-y-full',
)

export const momentSheetHandleVariants = cva('mb-1 h-1 w-10 rounded-full bg-border-control/50')

export const momentSheetTitleVariants = cva('font-display text-moment-title text-ink')

export const momentSheetTextVariants = cva('mb-2 text-dialog-text text-ink-muted')

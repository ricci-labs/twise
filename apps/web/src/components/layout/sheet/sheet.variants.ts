import { cva } from 'class-variance-authority'

export const sheetBackdropVariants = cva(
  'fixed inset-0 z-modal bg-ink/40 transition-opacity duration-normal data-ending-style:opacity-0 data-starting-style:opacity-0',
)

export const sheetPopupVariants = cva(
  'fixed inset-x-0 bottom-0 z-modal flex max-h-sheet flex-col gap-2 overflow-y-auto rounded-t-xl bg-surface px-4 pt-3 pb-safe shadow-dialog outline-none transition-transform duration-normal ease-emphasized data-ending-style:translate-y-full data-starting-style:translate-y-full',
)

export const sheetHandleVariants = cva('mx-auto mb-2 h-1 w-10 rounded-full bg-border')

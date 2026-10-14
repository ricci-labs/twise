import { cva } from 'class-variance-authority'

export const confirmBackdropVariants = cva(
  'fixed inset-0 z-modal bg-ink/40 transition-opacity duration-normal data-ending-style:opacity-0 data-starting-style:opacity-0',
)

export const confirmPopupVariants = cva(
  'fixed inset-x-5 top-1/2 z-modal mx-auto flex max-w-110 -translate-y-1/2 flex-col gap-2 rounded-xl bg-surface px-5 pt-5.5 pb-4.5 text-ink shadow-dialog outline-none transition duration-popover ease-out data-ending-style:scale-96 data-ending-style:opacity-0 data-starting-style:scale-96 data-starting-style:opacity-0',
)

export const confirmTitleVariants = cva('font-display text-title')

export const confirmDescriptionVariants = cva('text-body-sm text-ink-muted')

export const confirmActionsVariants = cva(
  'mt-3 flex flex-wrap justify-end gap-2 [&>*]:flex-auto [&>*]:px-4 lg:[&>*]:flex-none',
)

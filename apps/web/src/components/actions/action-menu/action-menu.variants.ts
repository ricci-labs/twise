import { cva } from 'class-variance-authority'

export const actionMenuPopupVariants = cva(
  'z-overlay flex min-w-60 flex-col gap-0.5 rounded-lg border border-border bg-surface p-1.5 shadow-dialog outline-none',
)

export const actionMenuItemVariants = cva(
  'flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 text-body text-ink outline-none select-none data-highlighted:bg-sunken aria-[current=true]:font-semibold',
)

export const actionMenuSeparatorVariants = cva('my-1 h-px bg-border')

export const actionMenuHeaderVariants = cva('px-3 pt-1.5 pb-1 text-caption text-ink-muted')

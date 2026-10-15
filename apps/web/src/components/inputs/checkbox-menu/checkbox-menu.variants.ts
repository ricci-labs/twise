import { cva } from 'class-variance-authority'

export const checkboxMenuPopupVariants = cva(
  'z-overlay flex w-72 flex-col rounded-md border border-border bg-surface p-1.5 shadow-dialog outline-none',
)

export const checkboxMenuItemVariants = cva(
  'group/item flex min-h-10 cursor-pointer items-center gap-2.5 rounded-sm px-2.5 text-body-sm font-medium text-ink outline-none select-none data-highlighted:bg-page',
)

export const checkboxMenuBoxVariants = cva(
  'grid size-4.5 shrink-0 place-items-center rounded-swatch border-2 border-ink-muted bg-surface text-on-action-primary group-data-checked/item:border-ink group-data-checked/item:bg-ink [&_svg]:size-3.5 [&_svg]:stroke-3',
)

export const checkboxMenuFootVariants = cva(
  'mt-1 flex justify-end border-t border-border px-1 pt-1',
)

export const checkboxMenuClearVariants = cva(
  'cursor-pointer rounded-sm px-1.5 py-1.5 text-body-sm font-semibold text-mint-ink underline underline-stroke underline-offset-4 outline-none data-disabled:cursor-default data-disabled:text-ink-subtle data-disabled:no-underline data-highlighted:bg-page',
)

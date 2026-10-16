import { cva } from 'class-variance-authority'

export const splitShortcutVariants = cva(
  'flex items-center gap-3 rounded-xl border border-border bg-surface py-3.5 ps-4 pe-3.5 text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring',
)

export const splitShortcutBodyVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5')

export const splitShortcutTitleVariants = cva('text-choice font-emphasis')

export const splitShortcutTextVariants = cva('text-note text-ink-muted')

export const splitShortcutEditVariants = cva(
  'mt-1 self-start text-body-sm font-semibold text-mint-ink underline underline-stroke underline-offset-3',
)

export const splitShortcutChevronVariants = cva('shrink-0 text-ink-muted')

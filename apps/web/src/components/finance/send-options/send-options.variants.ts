import { cva } from 'class-variance-authority'

export const sendOptionsVariants = cva('m-0 flex min-w-0 flex-col gap-2 border-0 p-0')

export const sendOptionsHeadingVariants = cva('m-0 text-note font-emphasis text-ink-muted')

export const sendOptionVariants = cva(
  [
    'flex w-full cursor-pointer items-center gap-3 rounded-md border border-border-control bg-surface px-3.5 py-2.5 text-start text-ink outline-none',
    'transition-colors duration-fast hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
    'aria-disabled:cursor-not-allowed aria-disabled:border-border aria-disabled:bg-page aria-disabled:text-ink-muted aria-disabled:hover:bg-page',
  ],
  {
    variants: {
      kind: {
        channel: 'min-h-16',
        copy: 'min-h-14 border-dashed',
      },
    },
    defaultVariants: { kind: 'channel' },
  },
)

export const sendOptionTextVariants = cva('flex min-w-0 flex-1 flex-col')

export const sendOptionTitleVariants = cva('text-row font-emphasis')

export const sendOptionDetailVariants = cva('text-row-detail wrap-anywhere text-ink-muted')

export const sendOptionIconVariants = cva('size-5.5 shrink-0')

export const sendOptionChevronVariants = cva('size-4.5 shrink-0 text-ink-muted')

export const sendOptionsAddVariants = cva('self-start text-label')

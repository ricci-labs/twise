import { cva } from 'class-variance-authority'

export const emailSendSheetVariants = cva('flex flex-col gap-2')

export const emailFactsVariants = cva('m-0 flex flex-col')

export const emailFactVariants = cva(
  'flex min-h-10 items-center justify-between gap-3 py-1.5 text-body-sm not-first:border-t not-first:border-border',
)

export const emailFactTermVariants = cva('shrink-0 text-ink-muted')

export const emailFactValueVariants = cva(
  'm-0 min-w-0 text-end font-semibold wrap-anywhere text-ink',
)

export const emailPreviewLinkVariants = cva(
  'inline-flex items-center gap-1.5 self-start text-label [&_svg]:size-4 [&_svg]:shrink-0',
)

export const emailCarriesVariants = cva('m-0 text-note text-ink-muted')

export const emailSendFooterVariants = cva(
  '-mx-4 mt-2 flex items-center gap-3 border-t border-border px-4 pt-4',
)

export const emailSendButtonVariants = cva('flex-1')

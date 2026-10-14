import { cva } from 'class-variance-authority'

export const fieldGroupVariants = cva('m-0 flex min-w-0 flex-col gap-2 border-0 p-0')

export const fieldGroupLabelVariants = cva('text-label font-medium text-ink')

export const fieldGroupRequiredVariants = cva('ml-1 font-semibold text-danger')

export const fieldGroupHelpVariants = cva('text-body-sm text-ink-muted')

export const fieldGroupErrorVariants = cva(
  'flex items-start gap-1 text-label font-medium text-danger [&_svg]:mt-px [&_svg]:size-4.5 [&_svg]:shrink-0',
)

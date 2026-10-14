import { cva } from 'class-variance-authority'

export const lockedFieldVariants = cva('m-0 flex min-w-0 flex-col gap-2 border-0 p-0')

export const lockedFieldLabelVariants = cva('text-label font-medium text-ink')

export const lockedFieldBoxVariants = cva(
  'flex min-h-control items-center gap-2 rounded-md bg-sunken px-3.5 text-ink-muted',
)

export const lockedFieldValueVariants = cva('text-choice font-semibold text-ink')

export const lockedFieldHelpVariants = cva('text-body-sm text-ink-muted')

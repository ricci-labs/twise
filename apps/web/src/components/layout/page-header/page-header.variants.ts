import { cva } from 'class-variance-authority'

export const pageHeaderVariants = cva(
  'flex items-center justify-between gap-3 lg:flex-wrap lg:items-end lg:gap-4',
)

export const pageHeaderTitleVariants = cva('font-display text-form-title-lg lg:text-display')

export const pageHeaderDescriptionVariants = cva(
  'mt-1 hidden text-dialog-text text-ink-muted lg:block',
)

export const pageHeaderActionsVariants = cva('flex shrink-0 items-center gap-2')

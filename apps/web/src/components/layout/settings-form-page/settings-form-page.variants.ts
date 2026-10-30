import { cva } from 'class-variance-authority'

export const settingsFormPageVariants = cva('flex flex-col gap-3 pb-6 lg:gap-5 lg:pb-0')

export const settingsFormPageBodyVariants = cva('flex flex-col gap-5 px-4 lg:max-w-160 lg:px-0')

export const settingsFormPageFooterVariants = cva(
  'fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-surface px-4 pt-3 pb-safe-roomy lg:static lg:max-w-160 lg:border-0 lg:bg-transparent lg:p-0',
)

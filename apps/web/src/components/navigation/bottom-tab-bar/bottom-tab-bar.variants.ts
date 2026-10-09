import { cva } from 'class-variance-authority'

export const bottomTabBarVariants = cva(
  'fixed inset-x-0 bottom-0 z-sticky grid grid-cols-5 border-t border-border bg-surface px-1.5 pt-1.5 pb-safe shadow-float lg:hidden',
)

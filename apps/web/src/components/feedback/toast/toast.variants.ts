import { cva } from 'class-variance-authority'

export const toastVariants = cva(
  'flex w-full items-center gap-2.5 rounded-lg bg-action-primary px-3.5 py-3 text-choice text-on-action-primary shadow-float lg:w-100',
)

export const toastIconVariants = cva('size-5.5 shrink-0', {
  variants: {
    tone: {
      success: 'text-accent-on-primary',
      danger: 'text-danger-on-primary',
    },
  },
  defaultVariants: { tone: 'success' },
})

export const toastMessageVariants = cva('min-w-0 flex-1')

export const toastActionVariants = cva(
  'shrink-0 cursor-pointer font-bold whitespace-nowrap text-accent-on-primary underline underline-offset-3',
)

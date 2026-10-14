import { cva } from 'class-variance-authority'

export const fieldVariants = cva('flex flex-col gap-2')

export const labelVariants = cva('text-label font-medium text-ink')

export const requiredMarkVariants = cva('ml-1 font-semibold text-danger')

export const helpVariants = cva('text-body-sm text-ink-muted', {
  variants: {
    gap: {
      tight: '-mt-1',
      roomy: '',
    },
  },
  defaultVariants: { gap: 'tight' },
})

export const errorVariants = cva(
  'flex items-start gap-1 text-label font-medium text-danger empty:hidden [&_svg]:mt-px [&_svg]:size-4.5 [&_svg]:shrink-0',
)

export const warningVariants = cva(
  'flex items-start gap-1.5 text-label font-medium text-warning empty:hidden [&_svg]:mt-px [&_svg]:size-4.5',
)

export const counterVariants = cva('text-right text-caption text-ink-muted tabular-nums')

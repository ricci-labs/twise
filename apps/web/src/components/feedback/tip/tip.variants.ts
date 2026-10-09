import { cva } from 'class-variance-authority'

export const tipVariants = cva(
  'flex items-center gap-2 text-body-sm [&>svg]:size-4.5 [&>svg]:shrink-0',
  {
    variants: {
      tone: {
        plain: 'justify-center text-current',
        readOnly: 'rounded-md bg-sunken px-3 py-2 text-ink-muted',
      },
    },
    defaultVariants: { tone: 'plain' },
  },
)

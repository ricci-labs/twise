import { cva } from 'class-variance-authority'

export const matchQuestionVariants = cva('flex flex-col gap-4')

export const matchQuestionTextVariants = cva(
  'text-body-sm text-ink-muted [&_strong]:font-semibold [&_strong]:text-ink',
)

export const matchOptionsVariants = cva('flex flex-col gap-2')

export const matchOptionVariants = cva(
  [
    'flex w-full flex-col gap-0.5 rounded-lg border border-border bg-surface px-4 py-3 text-start text-ink',
    'outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
  ],
  {
    variants: {
      isChoice: {
        true: 'cursor-pointer data-checked:border-transparent data-checked:inset-ring-2 data-checked:inset-ring-ink',
        false: '',
      },
    },
    defaultVariants: { isChoice: false },
  },
)

export const matchOptionTitleVariants = cva('line-clamp-2 text-row font-semibold break-words')

export const matchOptionDetailVariants = cva(
  'line-clamp-2 text-row-detail break-words text-ink-muted',
)

export const matchQuestionActionsVariants = cva('grid grid-cols-2 gap-3')

import { cva } from 'class-variance-authority'

export const trashRowVariants = cva('flex gap-2.5 border-border py-3 not-first:border-t', {
  variants: {
    isStacked: {
      true: 'flex-col items-stretch [&>button]:ml-14 [&>button]:self-start',
      false: 'items-center',
    },
  },
  defaultVariants: { isStacked: false },
})

export const trashRowMainVariants = cva(
  'flex min-w-0 flex-1 items-start gap-3 [&>[data-slot=category-art]]:-m-0.5',
)

export const trashRowTextVariants = cva(
  'flex min-w-0 flex-1 flex-col gap-0.5 text-row-detail text-ink-muted [&>p+p+p]:mt-0.5',
)

export const trashRowNameVariants = cva('flex items-start justify-between gap-3 text-row text-ink')

export const trashRowTitleVariants = cva('min-w-0')

export const trashRowNoteVariants = cva('text-ink')

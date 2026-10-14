import { cva } from 'class-variance-authority'

export const pickerFieldVariants = cva([
  'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-md border border-border-control bg-surface py-2 pr-3 pl-2 text-left text-ink outline-none lg:min-h-control lg:py-1',
  'focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink',
  'aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger',
  'disabled:cursor-not-allowed disabled:border-border disabled:bg-sunken',
  '[&>[data-slot=picker-chevron]]:size-4 [&>[data-slot=picker-chevron]]:shrink-0 [&>[data-slot=picker-chevron]]:text-ink-muted',
])

export const pickerTextVariants = cva('flex min-w-0 flex-1 flex-col')

export const pickerValueVariants = cva('truncate', {
  variants: {
    isEmpty: {
      true: 'text-body-sm font-medium text-ink-muted',
      false: 'text-title-sm',
    },
  },
  defaultVariants: { isEmpty: false },
})

export const pickerDetailVariants = cva('truncate text-caption font-normal text-ink-muted')

export const pickerEmptyArtVariants = cva(
  'grid size-8.5 shrink-0 place-items-center rounded-sm border-stroke border-dashed border-border-control text-ink-muted [&_svg]:size-4',
)

import { cva } from 'class-variance-authority'

export const pickerPositionerVariants = cva('z-modal')

export const pickerPopupVariants = cva(
  'flex max-h-96 flex-col gap-2 overflow-y-auto rounded-lg border border-border bg-surface p-2 text-ink shadow-dialog outline-none transition duration-popover ease-out data-ending-style:scale-96 data-ending-style:opacity-0 data-starting-style:scale-96 data-starting-style:opacity-0',
  {
    variants: {
      width: {
        field: 'w-anchor max-w-120 min-w-72',
        wide: 'w-96',
      },
    },
    defaultVariants: { width: 'field' },
  },
)

export const pickerSearchVariants = cva('px-1 lg:px-0')

export const pickerSubtitleVariants = cva('px-1 text-note font-medium text-ink-muted')

export const pickerListVariants = cva('', {
  variants: {
    layout: {
      list: '-mx-2 flex flex-col lg:mx-0',
      grid: 'grid grid-cols-3 gap-2',
      options: '-mx-2 flex flex-col gap-0.5 lg:mx-0',
    },
  },
  defaultVariants: { layout: 'list' },
})

export const pickerOptionVariants = cva([
  'flex min-h-touch w-full cursor-pointer items-center gap-3 rounded-md px-3 text-left text-body text-ink outline-none',
  'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring',
  'aria-current:font-emphasis aria-current:inset-ring-2 aria-current:inset-ring-ink',
])

export const pickerRowVariants = cva([
  'flex min-h-13 w-full cursor-pointer items-center gap-3.5 rounded-md px-3 text-left text-body text-ink outline-none',
  'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring',
  '[&>[data-slot=category-art]]:-m-0.75',
  'aria-current:inset-ring-2 aria-current:inset-ring-ink',
  '[&>[data-slot=picker-chevron]]:size-4 [&>[data-slot=picker-chevron]]:shrink-0 [&>[data-slot=picker-chevron]]:text-ink-muted',
])

export const pickerRowTextVariants = cva(
  'flex min-w-0 flex-1 flex-col font-medium in-aria-current:font-emphasis',
)

export const pickerRowDetailVariants = cva('truncate text-note', {
  variants: {
    isStrong: {
      true: 'font-semibold text-ink',
      false: 'font-medium text-ink-muted',
    },
  },
  defaultVariants: { isStrong: false },
})

export const pickerRowEndVariants = cva('shrink-0 text-note text-ink-muted')

export const pickerTileVariants = cva([
  'relative flex size-full cursor-pointer flex-col items-center gap-0.5 rounded-lg bg-sketch-paper px-1 pt-2.5 pb-3 text-center text-body-sm font-medium text-sketch-ink outline-none',
  'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  'aria-current:font-emphasis aria-current:ring-2 aria-current:ring-sketch-ink aria-current:ring-inset',
])

export const pickerTileDetailVariants = cva('text-caption text-sketch-ink/70')

export const pickerChildrenVariants = cva('flex flex-col gap-2 rounded-lg bg-page p-3')

export const pickerChildrenTitleVariants = cva('text-note font-medium text-ink-muted')

export const pickerEmptyVariants = cva(
  'flex flex-col items-center gap-1.5 px-3 pt-2 pb-4 text-center text-body-sm text-ink-muted [&_b]:text-title-sm [&_b]:text-ink',
)

export const pickerEmptyActionVariants = cva('mt-2.5')

export const pickerPlaceholderArtVariants = cva(
  'grid size-11.5 shrink-0 place-items-center rounded-md border-stroke border-dashed border-border-control text-ink-muted [&_svg]:size-4',
)

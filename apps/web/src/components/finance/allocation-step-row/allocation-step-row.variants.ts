import { cva } from 'class-variance-authority'

export const allocationStepRowVariants = cva(
  'relative flex min-h-18 items-center gap-2.5 rounded-xl border border-border bg-surface py-3 pr-2.5 pl-1.5 transition duration-fast lg:gap-3.5 lg:pr-3.5 lg:pl-2',
  {
    variants: {
      isLifted: {
        true: 'scale-102 border-ink shadow-float',
        false: '',
      },
      isInvalid: {
        true: 'border-danger py-3.5 ring-1 ring-danger ring-inset',
        false: '',
      },
      isReadOnly: {
        true: 'gap-3.5 py-3.5 pr-3.5 pl-4 lg:pr-3.5 lg:pl-4',
        false: '',
      },
    },
    defaultVariants: { isLifted: false, isInvalid: false, isReadOnly: false },
  },
)

export const allocationStepGripVariants = cva(
  'grid h-11 w-8 shrink-0 touch-none place-items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
  {
    variants: {
      isLifted: {
        true: 'cursor-grabbing text-ink',
        false: 'cursor-grab text-ink-subtle',
      },
    },
    defaultVariants: { isLifted: false },
  },
)

export const allocationStepArtVariants = cva('', {
  variants: {
    isInvalid: {
      true: 'opacity-50',
      false: '',
    },
  },
  defaultVariants: { isInvalid: false },
})

export const allocationStepBodyVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5', {
  variants: {
    isReadOnly: {
      true: '',
      false: 'pl-1',
    },
  },
  defaultVariants: { isReadOnly: false },
})

export const allocationStepPositionVariants = cva('text-caption tracking-wide', {
  variants: {
    isInvalid: {
      true: 'text-danger',
      false: 'text-ink-muted',
    },
  },
  defaultVariants: { isInvalid: false },
})

export const allocationStepTitleVariants = cva('line-clamp-2 text-row font-semibold break-words')

export const allocationStepDetailVariants = cva('line-clamp-2 text-note break-words text-ink-muted')

export const allocationStepInvalidVariants = cva(
  'mt-1 flex items-start gap-1.5 text-note font-semibold break-words text-danger [&>[data-slot=icon]]:mt-0.5',
)

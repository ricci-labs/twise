import { cva } from 'class-variance-authority'

export const formOverlayBackdropVariants = cva(
  'fixed inset-0 z-modal hidden bg-ink/40 transition-opacity duration-normal data-ending-style:opacity-0 data-starting-style:opacity-0 lg:block',
)

export const formOverlayPopupVariants = cva(
  [
    'fixed inset-x-0 top-safe bottom-0 z-modal flex flex-col bg-page text-ink outline-none',
    'lg:inset-x-0 lg:mx-auto lg:max-h-205 lg:overflow-hidden lg:rounded-xl lg:shadow-dialog',
    'transition duration-popover ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 lg:data-ending-style:scale-96 lg:data-starting-style:scale-96',
  ],
  {
    variants: {
      size: {
        lg: 'lg:top-10 lg:bottom-10 lg:w-220',
        md: 'lg:top-15 lg:bottom-15 lg:h-fit lg:w-140',
        roomy: 'lg:top-15 lg:bottom-15 lg:h-fit lg:w-180',
        wide: 'lg:top-15 lg:bottom-15 lg:h-fit lg:w-190',
        split: 'lg:top-15 lg:bottom-15 lg:h-fit lg:w-220',
      },
    },
    defaultVariants: { size: 'lg' },
  },
)

export const formOverlayHeadVariants = cva(
  'flex items-center gap-1 pt-2 pr-4 pl-1.5 lg:sticky lg:top-0 lg:z-sticky lg:flex-row-reverse lg:justify-between lg:bg-page lg:pt-4.5 lg:pb-1 lg:pl-8',
)

export const formOverlayTitleVariants = cva('font-display text-form-title lg:text-form-title-lg')

export const formOverlayCloseVariants = cva(
  'grid size-touch shrink-0 cursor-pointer place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-5',
)

export const formOverlayContentVariants = cva('flex min-h-0 flex-1 flex-col')

export const formOverlayScrollVariants = cva('min-h-0 flex-1 overflow-y-auto pb-6')

export const formOverlayFootVariants = cva(
  'flex flex-col gap-2 border-t border-border bg-surface px-4 pt-3 lg:pt-3.5 lg:pr-6 lg:pb-4 lg:pl-5',
  {
    variants: {
      actions: {
        stacked: 'pb-safe',
        single: 'pb-safe-roomy',
      },
    },
    defaultVariants: { actions: 'stacked' },
  },
)

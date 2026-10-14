import { cva } from 'class-variance-authority'

export const formOverlayBackdropVariants = cva(
  'fixed inset-0 z-modal hidden bg-ink/40 transition-opacity duration-normal data-ending-style:opacity-0 data-starting-style:opacity-0 lg:block',
)

export const formOverlayPopupVariants = cva([
  'fixed inset-0 z-modal flex flex-col bg-surface text-ink outline-none',
  'lg:inset-x-0 lg:top-10 lg:bottom-10 lg:mx-auto lg:max-h-205 lg:w-220 lg:overflow-hidden lg:rounded-xl lg:shadow-dialog',
  'transition duration-popover ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 lg:data-ending-style:scale-96 lg:data-starting-style:scale-96',
])

export const formOverlayHeadVariants = cva(
  'flex items-center gap-1 pt-2 pr-4 pl-1.5 lg:flex-row-reverse lg:justify-between lg:pt-4.5 lg:pl-8',
)

export const formOverlayTitleVariants = cva('font-display text-title-lg lg:text-display')

export const formOverlayCloseVariants = cva(
  'grid size-touch shrink-0 cursor-pointer place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-6',
)

export const formOverlayBodyVariants = cva('flex-1 overflow-y-auto pb-6')

export const formOverlayFootVariants = cva(
  'flex flex-col gap-2 border-t border-border bg-surface px-4 pt-3 pb-safe lg:px-6 lg:py-4',
)

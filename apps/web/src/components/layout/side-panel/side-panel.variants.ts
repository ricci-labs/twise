import { cva } from 'class-variance-authority'

export const sidePanelBackdropVariants = cva(
  'fixed inset-0 z-modal bg-ink/40 transition-opacity duration-normal data-ending-style:opacity-0 data-starting-style:opacity-0',
)

export const sidePanelPopupVariants = cva(
  'fixed inset-y-0 right-0 z-modal flex w-120 max-w-full flex-col bg-page text-ink shadow-dialog outline-none transition duration-popover ease-out data-ending-style:translate-x-8 data-ending-style:opacity-0 data-starting-style:translate-x-8 data-starting-style:opacity-0',
)

export const sidePanelHeadVariants = cva(
  'flex shrink-0 items-center gap-1 border-b border-border bg-surface py-3.5 pr-4 pl-6',
)

export const sidePanelTitleVariants = cva('mr-auto font-display text-card-title')

export const sidePanelCloseVariants = cva(
  'grid size-touch shrink-0 cursor-pointer place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-5',
)

export const sidePanelBodyVariants = cva('flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-6')

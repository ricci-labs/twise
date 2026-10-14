import { cva } from 'class-variance-authority'

export const subPageHeaderVariants = cva('flex items-start gap-1 pt-1.5 pr-4 pl-1.5')

export const subPageBackVariants = cva(
  '-mt-0.5 grid size-10 shrink-0 place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-5',
)

export const subPageTitleVariants = cva('font-display text-form-title-lg')

export const subPageDescriptionVariants = cva('mt-1 text-sub-page text-ink-muted')

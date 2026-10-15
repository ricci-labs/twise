import { cva } from 'class-variance-authority'

export const attachAreaVariants = cva(
  'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-md border-stroke border-dashed border-border-control bg-transparent px-3.5 text-left text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&>svg]:size-4.5 [&>svg]:shrink-0',
)

export const attachAreaTitleVariants = cva('block text-body-sm font-semibold')

export const attachAreaHintVariants = cva('block text-caption text-ink-muted')

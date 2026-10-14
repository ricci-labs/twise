import { cva } from 'class-variance-authority'

export const breadcrumbVariants = cva(
  'flex items-center gap-1.5 text-body-sm font-medium text-ink-muted [&_svg]:size-3.5 [&_svg]:shrink-0',
)

export const breadcrumbLinkVariants = cva(
  'rounded-sm font-semibold text-mint-ink underline underline-stroke underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
)

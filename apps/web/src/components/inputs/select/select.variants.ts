import { cva } from 'class-variance-authority'

export const selectBoxVariants = cva([
  'relative flex min-h-control items-center rounded-md border border-border-control bg-surface text-ink',
  'focus-within:border-ink focus-within:ring-1 focus-within:ring-ink',
  'has-[select[aria-invalid=true]]:border-danger has-[select[aria-invalid=true]]:ring-1 has-[select[aria-invalid=true]]:ring-danger',
  '[&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:right-3 [&>svg]:size-4 [&>svg]:text-ink-muted',
])

export const selectVariants = cva(
  'min-h-control w-full cursor-pointer appearance-none bg-transparent pr-10 pl-4 text-body text-ink outline-none disabled:cursor-not-allowed disabled:text-ink-muted',
)

import { cva } from 'class-variance-authority'

export const textAreaVariants = cva([
  'min-h-20 w-full resize-none rounded-md border border-border-control bg-surface px-4 py-2.5 text-body text-ink outline-none placeholder:text-ink-subtle',
  'focus:border-ink focus:ring-1 focus:ring-ink',
  'aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger',
  'read-only:border-border read-only:bg-sunken read-only:text-ink-muted',
])

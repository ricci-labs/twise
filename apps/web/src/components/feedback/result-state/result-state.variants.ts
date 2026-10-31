import { cva } from 'class-variance-authority'

export const resultStateVariants = cva(
  'flex flex-col items-center gap-1.5 px-5 pt-7 pb-5.5 text-center',
  {
    variants: {
      frame: {
        dashed: 'rounded-lg border border-dashed border-border-control bg-surface',
        card: 'rounded-lg border border-border bg-surface',
        bare: 'my-auto',
      },
    },
    defaultVariants: { frame: 'card' },
  },
)

export const resultStateArtVariants = cva('mb-1 grid place-items-center', {
  variants: {
    tone: {
      plain: '',
      neutral: 'size-13 rounded-full bg-sunken text-ink',
      danger: 'size-13 rounded-full bg-danger-soft text-danger',
    },
  },
  defaultVariants: { tone: 'plain' },
})

export const resultStateTitleVariants = cva('text-title-sm text-ink')

export const resultStateTextVariants = cva('max-w-90 text-body-sm text-ink-muted')

export const resultStateDetailVariants = cva('text-caption font-normal text-ink-subtle')

export const resultStateActionVariants = cva('mt-2.5')

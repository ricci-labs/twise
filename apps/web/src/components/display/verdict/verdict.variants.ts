import { cva } from 'class-variance-authority'

export const verdictVariants = cva('flex items-center gap-3.5 rounded-lg p-4', {
  variants: {
    tone: {
      ok: 'bg-mint text-on-mint',
      warn: 'bg-warning-soft text-ink',
      alert: 'bg-danger-soft text-ink [&_[data-slot=verdict-title]]:text-danger',
    },
  },
  defaultVariants: { tone: 'ok' },
})

export const verdictIconVariants = cva(
  'grid size-11 shrink-0 place-items-center rounded-full bg-surface',
  {
    variants: {
      tone: {
        ok: 'text-mint-ink',
        warn: 'text-warning',
        alert: 'text-danger',
      },
    },
    defaultVariants: { tone: 'ok' },
  },
)

export const verdictTextVariants = cva('flex min-w-0 flex-col')

export const verdictTitleVariants = cva('font-display text-title break-words')

export const verdictSentenceVariants = cva('text-body-sm break-words')

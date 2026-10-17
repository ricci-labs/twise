import { cva } from 'class-variance-authority'

export const chargeEmailPreviewVariants = cva(
  'flex min-w-0 flex-col gap-3.5 rounded-lg bg-page px-3 pt-4 pb-5 text-ink',
)

export const chargeEmailMetaVariants = cva('flex flex-col gap-0.5 text-fine text-ink-muted')

export const chargeEmailSubjectVariants = cva('m-0 text-label font-emphasis text-ink')

export const chargeEmailCardVariants = cva(
  'overflow-hidden rounded-lg border border-border bg-surface',
)

export const chargeEmailBandVariants = cva('flex h-37.5 justify-center bg-mint pt-3.5')

export const chargeEmailBodyVariants = cva('flex flex-col px-5.5 pt-6 pb-1.5')

export const chargeEmailGreetingVariants = cva('m-0 mb-1.5 text-dialog-text text-ink-muted')

export const chargeEmailHeadingVariants = cva('m-0 mb-2.5 font-display text-title-lg')

export const chargeEmailTextVariants = cva(
  'm-0 mb-3.5 text-body whitespace-pre-line wrap-break-word',
  {
    variants: { tone: { ink: 'text-ink', muted: 'text-ink-muted' } },
    defaultVariants: { tone: 'ink' },
  },
)

export const chargeEmailItemsVariants = cva('w-full border-collapse text-dialog-text tabular-nums')

export const chargeEmailCellVariants = cva('py-2.25 align-top', {
  variants: {
    part: {
      description: 'border-b border-border text-left font-normal',
      amount: 'border-b border-border pl-3 text-right font-emphasis whitespace-nowrap',
      totalLabel: 'border-t-2 border-ink text-left text-body font-heavy',
      totalAmount: 'border-t-2 border-ink pl-3 text-right text-body font-heavy whitespace-nowrap',
    },
  },
  defaultVariants: { part: 'description' },
})

export const chargeEmailDetailVariants = cva('block text-row-detail text-ink-muted')

export const chargeEmailDueVariants = cva('m-0 mt-1.5 mb-4 text-body-sm font-semibold', {
  variants: { tone: { overdue: 'text-danger', due: 'text-ink' } },
  defaultVariants: { tone: 'due' },
})

export const chargeEmailPixVariants = cva('flex items-center gap-3.5 rounded-md bg-mint-soft p-3.5')

export const chargeEmailQrVariants = cva(
  'grid size-26 shrink-0 place-items-center rounded-sm bg-surface p-2 text-ink [&_svg]:size-full',
)

export const chargeEmailPixTitleVariants = cva('m-0 text-title-sm')

export const chargeEmailPixTextVariants = cva('m-0 mt-1 text-body-sm text-ink-muted')

export const chargeEmailCodeLabelVariants = cva('m-0 mt-3.5 mb-1.5 text-note text-ink-muted')

export const chargeEmailCodeVariants = cva(
  'mb-4 block rounded-sm border border-dashed border-border-control px-3 py-2.5 font-mono text-code wrap-anywhere',
)

export const chargeEmailNotesVariants = cva(
  'mx-5.5 mt-1.5 flex flex-col gap-1.5 border-t border-border pt-3.5 pb-5 text-note text-ink-muted [&_strong]:text-ink',
)

export const chargeEmailFootVariants = cva(
  'flex flex-col items-center gap-0.5 px-2 text-center text-fine text-ink-muted [&_strong]:text-ink',
)

export const chargeEmailOptOutVariants = cva('text-ink underline')

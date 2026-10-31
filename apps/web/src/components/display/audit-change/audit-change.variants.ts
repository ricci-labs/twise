import { cva } from 'class-variance-authority'

export const auditChangeVariants = cva('flex flex-col gap-3.5')

export const auditChangeWhoVariants = cva('flex items-center gap-2.5')

export const auditChangeWhoTextVariants = cva('flex min-w-0 flex-col')

export const auditChangeTitleVariants = cva('text-title-sm break-words')

export const auditChangeDetailVariants = cva('text-note text-ink-muted')

export const auditChangeTableVariants = cva(
  'w-full table-fixed border-collapse text-body-sm tabular-nums',
)

export const auditChangeHeadVariants = cva(
  'border-b border-border px-2 py-2 text-left text-caption font-medium text-ink-muted',
)

export const auditChangeFieldVariants = cva(
  'w-2/7 border-b border-border px-2 py-2.25 text-left align-top font-semibold wrap-anywhere',
)

export const auditChangeCellVariants = cva(
  'border-b border-border px-2 py-2.25 align-top wrap-anywhere',
)

export const auditChangeRowVariants = cva('', {
  variants: {
    isChanged: {
      true: 'bg-warning-soft [&>td:last-child]:font-bold',
      false: '',
    },
  },
})

export const auditChangeNoteVariants = cva('text-note text-ink-muted [&>strong]:font-emphasis')

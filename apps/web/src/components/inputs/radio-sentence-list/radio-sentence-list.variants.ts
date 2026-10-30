import { cva } from 'class-variance-authority'

export const radioSentenceListVariants = cva('flex flex-col gap-2 data-disabled:opacity-60')

export const radioSentenceVariants = cva([
  'relative flex min-h-13 items-center gap-3 rounded-md border border-border-control bg-surface px-3.5 py-2 text-choice text-ink',
  'has-data-checked:border-ink has-data-checked:font-emphasis has-data-checked:inset-ring-1 has-data-checked:inset-ring-ink',
  'has-[[data-slot=radio-sentence-radio]:focus-visible]:ring-2 has-[[data-slot=radio-sentence-radio]:focus-visible]:ring-focus-ring has-[[data-slot=radio-sentence-radio]:focus-visible]:ring-offset-2',
])

export const radioSentenceRadioVariants = cva(
  'shrink-0 cursor-pointer outline-none after:absolute after:inset-0 after:rounded-md',
)

export const radioSentenceDotVariants = cva(
  'grid size-5 shrink-0 place-items-center rounded-full border-2 border-border-control bg-surface in-data-checked:border-6 in-data-checked:border-ink',
)

export const radioSentenceTextVariants = cva('flex min-w-0 flex-1 flex-wrap items-center gap-1.5')

export const radioSentencePickerVariants = cva('relative')

import { cva } from 'class-variance-authority'

export const entryDayGroupVariants = cva('flex flex-col gap-2')

export const entryDayTitleVariants = cva('mx-0.5 text-label font-bold text-ink')

export const entryDayDetailVariants = cva('font-medium text-ink-muted')

export const entryDayListVariants = cva('rounded-xl border border-border bg-surface px-3')

import type { splitExampleMessages } from '@web/components/finance/split-example/split-example.messages'

export type SplitExampleChoice = keyof typeof splitExampleMessages.choices

export type SplitExamplePart = {
  position: number
  label: string
  amountCents: number | null
}

export type SplitSeries = 's1' | 's2' | 's3' | 's4' | 's5'

export type SplitExampleProps = {
  choice: SplitExampleChoice
  onChoiceChange: (choice: SplitExampleChoice) => void
  choices?: readonly SplitExampleChoice[]
  customAmount: string
  onCustomAmountChange: (value: string) => void
  amountCents: number
  parts: readonly SplitExamplePart[]
  leftoverCents: number
  hasBar?: boolean
  title?: string
  footnote?: string
  className?: string
}

export type SplitBarProps = {
  parts: readonly SplitExamplePart[]
  leftoverCents: number
}

export type SplitBarSegment = {
  key: string
  series: SplitSeries | 'leftover'
  start: number
  width: number
}

export type SplitPartRowProps = {
  part: SplitExamplePart
  hasBar: boolean
}

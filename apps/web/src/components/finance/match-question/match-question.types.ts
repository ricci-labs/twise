export type MatchOption = {
  value: string
  title: string
  detail: string
}

export type MatchQuestionProps = {
  title: string
  lead?: string
  note?: string
  options: readonly MatchOption[]
  optionsLabel: string
  value: string | null
  onValueChange: (value: string) => void
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  declineLabel: string
  confirmLabel: string
  onDecline: () => void
  onConfirm: () => void
  isConfirming?: boolean
  problem?: string | null
}

export type MatchOptionCardProps = {
  option: MatchOption
}

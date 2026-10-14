export type TrashRowProps = {
  name: string
  icon: string | null
  details: readonly string[]
  note?: string | null
  actionLabel: string
  actionAccessibleLabel: string
  isBusy?: boolean
  onAction: () => void
}

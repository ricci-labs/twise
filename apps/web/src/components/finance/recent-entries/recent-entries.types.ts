export type RecentEntry = {
  key: string
  description: string
  icon: string | null
  amountCents: number
}

export type RecentEntriesProps = {
  entries: readonly RecentEntry[]
  pickedKey: string | null
  onPick: (key: string) => void
}

export type TrashTab = 'entries' | 'accounts'

export type TrashTabsProps = {
  value: TrashTab
  onChange: (tab: TrashTab) => void
  className?: string
}

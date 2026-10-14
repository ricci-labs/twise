export type MomentSheetProps = {
  art: string
  title: string
  text: string
  actionLabel: string
  dismissLabel: string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onAction: () => void
}

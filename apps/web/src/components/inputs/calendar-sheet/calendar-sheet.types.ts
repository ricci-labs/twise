import type { IsoDate } from '@financas/shared'

export type CalendarSheetProps = {
  title: string
  value: IsoDate | null
  today: IsoDate
  anchor?: Element | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSelect: (date: IsoDate) => void
}

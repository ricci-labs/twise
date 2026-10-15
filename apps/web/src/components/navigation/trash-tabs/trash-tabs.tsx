import { SegmentedControl } from '@web/components/actions/segmented-control'
import { trashTabsMessages as messages } from '@web/components/navigation/trash-tabs/trash-tabs.messages'
import type {
  TrashTab,
  TrashTabsProps,
} from '@web/components/navigation/trash-tabs/trash-tabs.types'
import { cn } from '@web/lib/cn'

const TABS: readonly TrashTab[] = ['entries', 'accounts']

export function TrashTabs({ value, onChange, className }: TrashTabsProps) {
  return (
    <SegmentedControl
      label={messages.label}
      value={value}
      width="full"
      className={cn('shrink-0', className)}
      options={TABS.map((tab) => ({ value: tab, label: messages[tab] }))}
      onValueChange={(next) => onChange(next === 'accounts' ? 'accounts' : 'entries')}
    />
  )
}

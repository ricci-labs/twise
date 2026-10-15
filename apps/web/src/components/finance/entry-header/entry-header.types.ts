import type { EntryDirection } from '@web/components/finance/entry-row'

export type EntryHeaderProps = {
  art: { name: string; icon: string | null }
  typeLabel: string
  description: string
  amountCents: number
  direction: EntryDirection
  detail: string
}

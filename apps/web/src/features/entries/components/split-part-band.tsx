import { formatBrl } from '@financas/shared'
import { CategoryArt } from '@web/components/display/category-art'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { SplitPartBandProps } from '@web/features/entries/entries.types'

const messages = entriesMessages.transfers
const SPLIT_ART = 'coin'

export function SplitPartBand({ part, amountCents }: SplitPartBandProps) {
  return (
    <div className="mx-4 mt-3.5 flex items-center gap-3 rounded-lg bg-mint-soft px-3.5 py-2.5 lg:mx-8">
      <CategoryArt name={messages.splitPart(part.position)} icon={SPLIT_ART} size="md" />
      <p className="flex min-w-0 flex-col">
        <span className="text-row font-semibold">{messages.splitPart(part.position)}</span>
        <span className="line-clamp-2 text-row-detail text-ink-muted">
          {messages.splitDetail(part.label, formatBrl(amountCents))}
        </span>
      </p>
    </div>
  )
}

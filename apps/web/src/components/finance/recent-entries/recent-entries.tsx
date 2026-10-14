import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import { recentEntriesMessages as messages } from '@web/components/finance/recent-entries/recent-entries.messages'
import type { RecentEntriesProps } from '@web/components/finance/recent-entries/recent-entries.types'
import {
  recentEntriesRowVariants,
  recentEntriesTitleVariants,
  recentEntriesVariants,
  recentEntryAmountVariants,
  recentEntryTextVariants,
  recentEntryVariants,
} from '@web/components/finance/recent-entries/recent-entries.variants'
import { useId } from 'react'

export function RecentEntries({ entries, pickedKey, onPick }: RecentEntriesProps) {
  const titleId = useId()
  if (entries.length === 0) {
    return null
  }
  return (
    <section
      data-slot="recent-entries"
      aria-labelledby={titleId}
      className={recentEntriesVariants()}
    >
      <h2 id={titleId} className={recentEntriesTitleVariants()}>
        {messages.title}
      </h2>
      <ul className={recentEntriesRowVariants()}>
        {entries.map((entry) => (
          <li key={entry.key}>
            <button
              type="button"
              aria-pressed={entry.key === pickedKey}
              onClick={() => onPick(entry.key)}
              className={recentEntryVariants()}
            >
              <CategoryArt name={entry.description} icon={entry.icon} size="lg" />
              <span className={recentEntryTextVariants()}>
                {entry.description}
                <span className={recentEntryAmountVariants()}>
                  <Amount cents={entry.amountCents} size="inherit" />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

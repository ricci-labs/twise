import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import type { EntryHeaderProps } from '@web/components/finance/entry-header/entry-header.types'
import {
  entryHeaderAmountVariants,
  entryHeaderDetailVariants,
  entryHeaderTitleVariants,
  entryHeaderTopVariants,
  entryHeaderTypeVariants,
  entryHeaderVariants,
} from '@web/components/finance/entry-header/entry-header.variants'

export function EntryHeader({
  art,
  typeLabel,
  description,
  amountCents,
  direction,
  detail,
}: EntryHeaderProps) {
  return (
    <section data-slot="entry-header" className={entryHeaderVariants()}>
      <div className={entryHeaderTopVariants()}>
        <CategoryArt name={art.name} icon={art.icon} size="lg" />
        <div className="min-w-0">
          <span className={entryHeaderTypeVariants()}>{typeLabel}</span>
          <h2 className={entryHeaderTitleVariants()}>{description}</h2>
        </div>
      </div>
      <Amount
        cents={Math.abs(amountCents)}
        sign={direction === 'in' ? 'always' : 'auto'}
        size="inherit"
        isCentsRaised
        className={entryHeaderAmountVariants({ direction })}
      />
      <p className={entryHeaderDetailVariants()}>{detail}</p>
    </section>
  )
}

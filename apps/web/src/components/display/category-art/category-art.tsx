import calendar from '@web/assets/illustrations/calendar.svg'
import card from '@web/assets/illustrations/card.svg'
import coin from '@web/assets/illustrations/coin.svg'
import groceries from '@web/assets/illustrations/groceries.svg'
import health from '@web/assets/illustrations/health.svg'
import house from '@web/assets/illustrations/house.svg'
import leisure from '@web/assets/illustrations/leisure.svg'
import piggyBank from '@web/assets/illustrations/piggy-bank.svg'
import receipt from '@web/assets/illustrations/receipt.svg'
import together from '@web/assets/illustrations/together.svg'
import transport from '@web/assets/illustrations/transport.svg'
import travel from '@web/assets/illustrations/travel.svg'
import wallet from '@web/assets/illustrations/wallet.svg'
import type { CategoryArtProps } from '@web/components/display/category-art/category-art.types'
import { categoryArtVariants } from '@web/components/display/category-art/category-art.variants'
import { cn } from '@web/lib/cn'

const ART: Readonly<Record<string, string>> = {
  calendar,
  card,
  coin,
  groceries,
  health,
  house,
  leisure,
  'piggy-bank': piggyBank,
  receipt,
  together,
  transport,
  travel,
  wallet,
}

export function CategoryArt({ name, icon, size, className }: CategoryArtProps) {
  const art = icon ? ART[icon] : undefined
  return (
    <span
      data-slot="category-art"
      aria-hidden="true"
      className={cn(categoryArtVariants({ size }), className)}
    >
      {art ? (
        <img src={art} alt="" className="size-full" />
      ) : (
        name.trim().charAt(0).toLocaleUpperCase('pt-BR')
      )}
    </span>
  )
}

import calendar from '@web/assets/illustrations/calendar.svg'
import card from '@web/assets/illustrations/card.svg'
import coin from '@web/assets/illustrations/coin.svg'
import groceries from '@web/assets/illustrations/groceries.svg'
import health from '@web/assets/illustrations/health.svg'
import house from '@web/assets/illustrations/house.svg'
import leisure from '@web/assets/illustrations/leisure.svg'
import looseCalendar from '@web/assets/illustrations/loose/calendar.svg'
import looseCard from '@web/assets/illustrations/loose/card.svg'
import looseCoin from '@web/assets/illustrations/loose/coin.svg'
import looseGroceries from '@web/assets/illustrations/loose/groceries.svg'
import looseHealth from '@web/assets/illustrations/loose/health.svg'
import looseHouse from '@web/assets/illustrations/loose/house.svg'
import looseInvoicePaid from '@web/assets/illustrations/loose/invoice-paid.svg'
import looseLeisure from '@web/assets/illustrations/loose/leisure.svg'
import loosePiggyBank from '@web/assets/illustrations/loose/piggy-bank.svg'
import looseReceipt from '@web/assets/illustrations/loose/receipt.svg'
import looseTogether from '@web/assets/illustrations/loose/together.svg'
import looseTransport from '@web/assets/illustrations/loose/transport.svg'
import looseTravel from '@web/assets/illustrations/loose/travel.svg'
import looseWallet from '@web/assets/illustrations/loose/wallet.svg'
import piggyBank from '@web/assets/illustrations/piggy-bank.svg'
import receipt from '@web/assets/illustrations/receipt.svg'
import together from '@web/assets/illustrations/together.svg'
import transport from '@web/assets/illustrations/transport.svg'
import travel from '@web/assets/illustrations/travel.svg'
import wallet from '@web/assets/illustrations/wallet.svg'
import type {
  CategoryArtProps,
  CategoryArtVariant,
  CategoryDrawing,
} from '@web/components/display/category-art/category-art.types'
import {
  categoryArtImageVariants,
  categoryArtVariants,
} from '@web/components/display/category-art/category-art.variants'
import { cn } from '@web/lib/cn'

const LOOSE_ART: Readonly<Record<string, string>> = {
  calendar: looseCalendar,
  card: looseCard,
  coin: looseCoin,
  groceries: looseGroceries,
  health: looseHealth,
  house: looseHouse,
  'invoice-paid': looseInvoicePaid,
  leisure: looseLeisure,
  'piggy-bank': loosePiggyBank,
  receipt: looseReceipt,
  together: looseTogether,
  transport: looseTransport,
  travel: looseTravel,
  wallet: looseWallet,
}

const ON_PAPER_ART: Readonly<Record<string, string>> = {
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

export function CategoryArt({ name, icon, variant, size, className }: CategoryArtProps) {
  const drawings = drawingsOf(icon, variant ?? 'loose')
  return (
    <span
      data-slot="category-art"
      aria-hidden="true"
      className={cn(categoryArtVariants({ variant, size, hasArt: drawings.length > 0 }), className)}
    >
      {drawings.map((drawing) => (
        <img
          key={drawing.src}
          src={drawing.src}
          alt=""
          className={categoryArtImageVariants({ theme: drawing.theme })}
        />
      ))}
      {drawings.length === 0 && name.trim().charAt(0).toLocaleUpperCase('pt-BR')}
    </span>
  )
}

function drawingsOf(
  icon: string | null | undefined,
  variant: CategoryArtVariant,
): CategoryDrawing[] {
  const loose = icon ? LOOSE_ART[icon] : undefined
  const onPaper = icon ? ON_PAPER_ART[icon] : undefined
  if (!loose) {
    return onPaper ? [{ src: onPaper, theme: 'any' }] : []
  }
  if (variant === 'onLight' || !onPaper) {
    return [{ src: loose, theme: 'any' }]
  }
  return [
    { src: loose, theme: 'light' },
    { src: onPaper, theme: 'dark' },
  ]
}

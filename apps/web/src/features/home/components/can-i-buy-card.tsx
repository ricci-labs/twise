import { Link } from '@tanstack/react-router'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { homeMessages } from '@web/features/home/home.messages'
import type { CanIBuyCardProps } from '@web/features/home/home.types'
import { cn } from '@web/lib/cn'
import { ChevronRight } from 'lucide-react'

export function CanIBuyCard({ workspaceId, className }: CanIBuyCardProps) {
  return (
    <Link
      to="/w/$workspaceId/$area"
      params={{ workspaceId, area: 'can-i-buy' }}
      className={cn(
        'flex min-h-16 items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 hover:bg-sunken',
        className,
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-mint-soft">
        <TwiseIcon name="bag" tone="accent" size="md" />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-body font-semibold">{homeMessages.canIBuy.title}</span>
        <span className="text-body-sm text-ink-muted">{homeMessages.canIBuy.text}</span>
      </span>
      <ChevronRight className="size-5 text-ink-muted" aria-hidden="true" />
    </Link>
  )
}

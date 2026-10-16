import { formatBrl } from '@financas/shared'
import { ProgressBar } from '@web/components/charts/progress-bar'
import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { CategoryArt } from '@web/components/display/category-art'
import { RichText } from '@web/components/display/rich-text'
import { goalCardMessages as messages } from '@web/components/finance/goal-card/goal-card.messages'
import type { GoalCardProps } from '@web/components/finance/goal-card/goal-card.types'
import {
  goalCardAccountVariants,
  goalCardActionsVariants,
  goalCardAmountVariants,
  goalCardBadgeVariants,
  goalCardFootEndVariants,
  goalCardFootVariants,
  goalCardHintVariants,
  goalCardNameBoxVariants,
  goalCardNameVariants,
  goalCardSavedVariants,
  goalCardTargetVariants,
  goalCardTopVariants,
  goalCardVariants,
} from '@web/components/finance/goal-card/goal-card.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { fill } from '@web/lib/format/template'

export function GoalCard({
  name,
  art,
  accountName,
  savedCents,
  targetCents,
  percent,
  remainingCents,
  overCents,
  deadlineLabel,
  monthlyToTargetCents,
  actions,
}: GoalCardProps) {
  const isReached = remainingCents === 0
  return (
    <li data-slot="goal-card" className={goalCardVariants()}>
      <div className={goalCardTopVariants()}>
        <CategoryArt name={art.name} icon={art.icon} size="md" />
        <div className={goalCardNameBoxVariants()}>
          <h3 className={goalCardNameVariants()}>{name}</h3>
          <p className={goalCardAccountVariants()}>
            {isReached && (
              <Badge tone="success" size="compact" hasDot className={goalCardBadgeVariants()}>
                {messages.reached}
              </Badge>
            )}
            <span>{fill(messages.keptIn, { account: accountName })}</span>
          </p>
        </div>
        {actions && <div className={goalCardActionsVariants()}>{actions}</div>}
      </div>
      <p className={goalCardAmountVariants()}>
        <Amount cents={savedCents} size="inherit" className={goalCardSavedVariants()} />
        <span className={goalCardTargetVariants()}>
          {fill(messages.of, { target: formatBrl(targetCents) })}
        </span>
      </p>
      <div role="img" aria-label={messages.progress(percent)}>
        <ProgressBar percent={percent} tone={isReached ? 'within' : 'goal'} thickness="lg" />
      </div>
      <p className={goalCardFootVariants()}>
        <span>
          {deadlineLabel
            ? fill(messages.until, { percent, deadline: deadlineLabel })
            : fill(messages.noDeadline, { percent })}
        </span>
        <span className={goalCardFootEndVariants()}>{restOf(remainingCents, overCents)}</span>
      </p>
      {isReached ? (
        <p className={goalCardHintVariants({ isReached: true })}>
          <TwiseIcon name="ok" size="sm" />
          <span>{messages.reachedHint}</span>
        </p>
      ) : (
        deadlineLabel &&
        monthlyToTargetCents !== null && (
          <p className={goalCardHintVariants()}>
            <TwiseIcon name="calendar" size="sm" />
            <span>
              <RichText
                text={messages.monthly}
                values={{ deadline: deadlineLabel, amount: formatBrl(monthlyToTargetCents) }}
              />
            </span>
          </p>
        )
      )}
    </li>
  )
}

function restOf(remainingCents: number, overCents: number): string {
  if (remainingCents > 0) {
    return fill(messages.left, { amount: formatBrl(remainingCents) })
  }
  return overCents > 0 ? fill(messages.over, { amount: formatBrl(overCents) }) : messages.done
}

import { Button } from '@web/components/actions/button'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import type { PageMissingProps } from '@web/features/accounts/accounts.types'

export function CardMissing({ title, backLabel, back }: PageMissingProps) {
  return (
    <EmptyBlock
      icon="card"
      title={title}
      action={
        <Button variant="secondary" render={back}>
          {backLabel}
        </Button>
      }
    />
  )
}

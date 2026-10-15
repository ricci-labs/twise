import { Button } from '@web/components/actions/button'
import type { ListEndProps } from '@web/components/feedback/list-end/list-end.types'
import {
  listEndTextVariants,
  listEndVariants,
} from '@web/components/feedback/list-end/list-end.variants'
import { ChevronLeft } from 'lucide-react'

export function ListEnd({ message, previous }: ListEndProps) {
  return (
    <div data-slot="list-end" className={listEndVariants()}>
      <p className={listEndTextVariants()}>{message}</p>
      {previous && (
        <Button variant="secondary" size="sm" render={previous.link}>
          <ChevronLeft aria-hidden="true" />
          {previous.label}
        </Button>
      )}
    </div>
  )
}

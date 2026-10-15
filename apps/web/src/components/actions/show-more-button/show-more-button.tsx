import { Button } from '@web/components/actions/button'
import { showMoreButtonMessages as messages } from '@web/components/actions/show-more-button/show-more-button.messages'
import type { ShowMoreButtonProps } from '@web/components/actions/show-more-button/show-more-button.types'
import { ChevronDown } from 'lucide-react'

export function ShowMoreButton({ hiddenCount, isLoading = false, onClick }: ShowMoreButtonProps) {
  return (
    <Button
      variant="subtle"
      size="sm"
      width="full"
      isLoading={isLoading}
      loadingLabel={messages.loading}
      onClick={onClick}
    >
      {hiddenCount === undefined ? messages.label : messages.labelWithCount(hiddenCount)}
      <ChevronDown aria-hidden="true" />
    </Button>
  )
}

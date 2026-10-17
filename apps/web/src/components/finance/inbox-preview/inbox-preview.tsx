import { inboxPreviewMessages as messages } from '@web/components/finance/inbox-preview/inbox-preview.messages'
import type { InboxPreviewProps } from '@web/components/finance/inbox-preview/inbox-preview.types'
import {
  inboxPreviewHeadVariants,
  inboxPreviewPreheaderVariants,
  inboxPreviewSenderVariants,
  inboxPreviewSubjectVariants,
  inboxPreviewTimeVariants,
  inboxPreviewVariants,
} from '@web/components/finance/inbox-preview/inbox-preview.variants'
import { cn } from '@web/lib/cn'

export function InboxPreview({
  sender,
  subject,
  preheader,
  time = messages.time,
  className,
}: InboxPreviewProps) {
  return (
    <div data-slot="inbox-preview" className={cn(inboxPreviewVariants(), className)}>
      <div className={inboxPreviewHeadVariants()}>
        <p className={inboxPreviewSenderVariants()}>{sender}</p>
        <span className={inboxPreviewTimeVariants()}>{time}</span>
      </div>
      <p title={subject} className={inboxPreviewSubjectVariants()}>
        {subject}
      </p>
      <p title={preheader} className={inboxPreviewPreheaderVariants()}>
        {preheader}
      </p>
    </div>
  )
}

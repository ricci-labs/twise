import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { emailSendSheetMessages as messages } from '@web/components/finance/email-send-sheet/email-send-sheet.messages'
import type {
  EmailFactProps,
  EmailSendSheetProps,
} from '@web/components/finance/email-send-sheet/email-send-sheet.types'
import {
  emailCarriesVariants,
  emailFactsVariants,
  emailFactTermVariants,
  emailFactValueVariants,
  emailFactVariants,
  emailPreviewLinkVariants,
  emailSendButtonVariants,
  emailSendFooterVariants,
  emailSendSheetVariants,
} from '@web/components/finance/email-send-sheet/email-send-sheet.variants'
import { Sheet } from '@web/components/layout/sheet'
import { Eye, Send } from 'lucide-react'

export function EmailSendSheet({
  isOpen,
  onOpenChange,
  to,
  subject,
  replyTo,
  hasPix,
  onPreview,
  onSend,
  isSending = false,
}: EmailSendSheetProps) {
  return (
    <Sheet
      title={messages.title}
      closeLabel={messages.close}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <div data-slot="email-send-sheet" className={emailSendSheetVariants()}>
        <dl className={emailFactsVariants()}>
          <EmailFact term={messages.to}>{to}</EmailFact>
          <EmailFact term={messages.subject}>{subject}</EmailFact>
          <EmailFact term={messages.replyTo}>
            {messages.replyToValue(replyTo.email, replyTo.name)}
          </EmailFact>
        </dl>
        <TextLink
          render={<button type="button" />}
          onClick={onPreview}
          className={emailPreviewLinkVariants()}
        >
          <Eye aria-hidden="true" />
          {messages.preview}
        </TextLink>
        <p className={emailCarriesVariants()}>
          {hasPix ? messages.carriesWithPix : messages.carries}
        </p>
        <div className={emailSendFooterVariants()}>
          <Button variant="tertiary" onClick={() => onOpenChange(false)}>
            {messages.back}
          </Button>
          <Button
            isLoading={isSending}
            loadingLabel={messages.sending}
            onClick={onSend}
            className={emailSendButtonVariants()}
          >
            <Send aria-hidden="true" />
            {messages.send}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

function EmailFact({ term, children }: EmailFactProps) {
  return (
    <div className={emailFactVariants()}>
      <dt className={emailFactTermVariants()}>{term}</dt>
      <dd className={emailFactValueVariants()}>{children}</dd>
    </div>
  )
}

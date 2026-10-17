import { TextLink } from '@web/components/actions/text-link'
import { sendOptionsMessages as messages } from '@web/components/finance/send-options/send-options.messages'
import type {
  SendOptionProps,
  SendOptionsProps,
} from '@web/components/finance/send-options/send-options.types'
import {
  sendOptionChevronVariants,
  sendOptionDetailVariants,
  sendOptionIconVariants,
  sendOptionsAddVariants,
  sendOptionsHeadingVariants,
  sendOptionsVariants,
  sendOptionTextVariants,
  sendOptionTitleVariants,
  sendOptionVariants,
} from '@web/components/finance/send-options/send-options.variants'
import { cn } from '@web/lib/cn'
import { ChevronRight, Copy, Mail, MessageCircle } from 'lucide-react'
import { useId } from 'react'

export function SendOptions({
  contactName,
  message,
  whatsapp,
  email,
  onCopied,
  onCopyFailed,
  onAddChannel,
  className,
}: SendOptionsProps) {
  const headingId = useId()
  const copy = () => {
    if (!navigator.clipboard) {
      onCopyFailed?.()
      return
    }
    navigator.clipboard.writeText(message).then(
      () => onCopied?.(),
      () => onCopyFailed?.(),
    )
  }
  return (
    <fieldset
      data-slot="send-options"
      aria-labelledby={headingId}
      className={cn(sendOptionsVariants(), className)}
    >
      <p id={headingId} className={sendOptionsHeadingVariants()}>
        {messages.heading}
      </p>
      {whatsapp && (
        <SendOption
          icon={MessageCircle}
          title={messages.whatsapp}
          detail={messages.whatsappDetail(whatsapp.phone)}
          onPress={whatsapp.onSend}
        />
      )}
      {email && (
        <SendOption
          icon={Mail}
          title={messages.email}
          detail={
            email.isOptedOut
              ? messages.emailOptedOut(contactName)
              : messages.emailDetail(email.address)
          }
          onPress={email.onSend}
          isDisabled={email.isOptedOut}
        />
      )}
      <SendOption
        kind="copy"
        icon={Copy}
        title={messages.copy}
        detail={messages.copyDetail}
        onPress={copy}
      />
      {!whatsapp && !email && onAddChannel && (
        <TextLink
          render={<button type="button" />}
          onClick={onAddChannel}
          className={sendOptionsAddVariants()}
        >
          {messages.addChannel}
        </TextLink>
      )}
    </fieldset>
  )
}

function SendOption({
  kind = 'channel',
  icon: Icon,
  title,
  detail,
  onPress,
  isDisabled = false,
}: SendOptionProps) {
  const hasChevron = kind === 'channel' && !isDisabled
  return (
    <button
      type="button"
      aria-disabled={isDisabled || undefined}
      onClick={isDisabled ? undefined : onPress}
      className={sendOptionVariants({ kind })}
    >
      <Icon aria-hidden="true" className={sendOptionIconVariants()} />
      <span className={sendOptionTextVariants()}>
        <span className={sendOptionTitleVariants()}>{title}</span>
        <span className={sendOptionDetailVariants()}>{detail}</span>
      </span>
      {hasChevron && <ChevronRight aria-hidden="true" className={sendOptionChevronVariants()} />}
    </button>
  )
}

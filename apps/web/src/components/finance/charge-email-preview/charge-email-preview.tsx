import { formatBrl, toBrazilianDate } from '@financas/shared'
import { Logo } from '@web/components/brand/logo'
import { OwlScene } from '@web/components/brand/owl-scene'
import { RichText } from '@web/components/display/rich-text'
import { chargeEmailPreviewMessages as messages } from '@web/components/finance/charge-email-preview/charge-email-preview.messages'
import type {
  ChargeEmailPix,
  ChargeEmailPreviewProps,
} from '@web/components/finance/charge-email-preview/charge-email-preview.types'
import {
  chargeEmailBandVariants,
  chargeEmailBodyVariants,
  chargeEmailCardVariants,
  chargeEmailCellVariants,
  chargeEmailCodeLabelVariants,
  chargeEmailCodeVariants,
  chargeEmailDetailVariants,
  chargeEmailDueVariants,
  chargeEmailFootVariants,
  chargeEmailGreetingVariants,
  chargeEmailHeadingVariants,
  chargeEmailItemsVariants,
  chargeEmailMetaVariants,
  chargeEmailNotesVariants,
  chargeEmailOptOutVariants,
  chargeEmailPixTextVariants,
  chargeEmailPixTitleVariants,
  chargeEmailPixVariants,
  chargeEmailPreviewVariants,
  chargeEmailQrVariants,
  chargeEmailSubjectVariants,
  chargeEmailTextVariants,
} from '@web/components/finance/charge-email-preview/charge-email-preview.variants'
import { cn } from '@web/lib/cn'
import { QrCode } from 'lucide-react'

export function ChargeEmailPreview(props: ChargeEmailPreviewProps) {
  const { subject, sender, replyTo, requesterName, workspaceName, className } = props
  return (
    <article
      data-slot="charge-email-preview"
      aria-label={messages.label}
      className={cn(chargeEmailPreviewVariants(), className)}
    >
      <div className={chargeEmailMetaVariants()}>
        <p className={chargeEmailSubjectVariants()}>{subject}</p>
        <p className="m-0">{replyTo ? messages.senderAndReplyTo(sender, replyTo) : sender}</p>
      </div>
      <Logo variant="lockup" className="self-start" />
      <div className={chargeEmailCardVariants()}>
        <div className={chargeEmailBandVariants()}>
          <OwlScene scene="together" />
        </div>
        <ChargeEmailBody {...props} />
        <div className={chargeEmailNotesVariants()}>
          {props.pix && (
            <p className="m-0">
              <RichText
                text={messages.receiver}
                values={{ nome: props.pix.receiverName, cidade: props.pix.receiverCity }}
              />
            </p>
          )}
          <p className="m-0">{messages.alreadyPaid(requesterName)}</p>
        </div>
      </div>
      <div className={chargeEmailFootVariants()}>
        <p className="m-0">
          <RichText text={messages.signature} />
        </p>
        <p className="m-0">{messages.why(requesterName, workspaceName)}</p>
        <span className={chargeEmailOptOutVariants()}>{messages.optOut}</span>
      </div>
    </article>
  )
}

function ChargeEmailBody({
  contactName,
  requesterName,
  opening,
  closing,
  items,
  totalCents,
  dueOn,
  isOverdue,
  pix,
}: ChargeEmailPreviewProps) {
  return (
    <div className={chargeEmailBodyVariants()}>
      <p className={chargeEmailGreetingVariants()}>{messages.greeting(contactName)}</p>
      <p className={chargeEmailHeadingVariants()}>
        {messages.heading(formatBrl(totalCents), requesterName)}
      </p>
      <p className={chargeEmailTextVariants()}>{opening}</p>
      <table className={chargeEmailItemsVariants()}>
        <thead className="sr-only">
          <tr>
            <th scope="col">{messages.item}</th>
            <th scope="col">{messages.amount}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.key}>
              <td className={chargeEmailCellVariants()}>
                {item.description}
                {item.detail && (
                  <small className={chargeEmailDetailVariants()}>{item.detail}</small>
                )}
              </td>
              <td className={chargeEmailCellVariants({ part: 'amount' })}>
                {formatBrl(item.amountCents)}
              </td>
            </tr>
          ))}
          <tr>
            <th scope="row" className={chargeEmailCellVariants({ part: 'totalLabel' })}>
              {messages.total}
            </th>
            <td className={chargeEmailCellVariants({ part: 'totalAmount' })}>
              {formatBrl(totalCents)}
            </td>
          </tr>
        </tbody>
      </table>
      {dueOn && (
        <p className={chargeEmailDueVariants({ tone: isOverdue ? 'overdue' : 'due' })}>
          {(isOverdue ? messages.overdue : messages.due)(toBrazilianDate(dueOn))}
        </p>
      )}
      {pix && <ChargeEmailPixBlock {...pix} />}
      {closing && <p className={chargeEmailTextVariants({ tone: 'muted' })}>{closing}</p>}
    </div>
  )
}

function ChargeEmailPixBlock({ payload }: ChargeEmailPix) {
  return (
    <>
      <div className={chargeEmailPixVariants()}>
        <span className={chargeEmailQrVariants()}>
          <QrCode aria-hidden="true" />
        </span>
        <div>
          <p className={chargeEmailPixTitleVariants()}>{messages.pixTitle}</p>
          <p className={chargeEmailPixTextVariants()}>
            <RichText text={messages.pixHow} />
          </p>
        </div>
      </div>
      <p className={chargeEmailCodeLabelVariants()}>{messages.codeLabel}</p>
      <code className={chargeEmailCodeVariants()}>{payload}</code>
    </>
  )
}

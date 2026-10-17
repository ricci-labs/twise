import { DEFAULT_CHARGE_TEXT, formatBrl } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { Avatar } from '@web/components/display/avatar'
import { Alert } from '@web/components/feedback/alert'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { ChargeEmailPreview } from '@web/components/finance/charge-email-preview'
import { ChargePreview } from '@web/components/finance/charge-preview'
import { EmailSendSheet } from '@web/components/finance/email-send-sheet'
import { MessageBubble } from '@web/components/finance/message-bubble'
import { NothingToCharge } from '@web/components/finance/nothing-to-charge'
import { PixBox } from '@web/components/finance/pix-box'
import { SendOptions } from '@web/components/finance/send-options'
import { UntilChips } from '@web/components/finance/until-chips'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { Sheet } from '@web/components/layout/sheet'
import {
  chargeQueryOptions,
  chargeTextQueryOptions,
  pixReceiverQueryOptions,
} from '@web/features/contacts/api/contacts.queries'
import {
  useCreateCharge,
  useMarkChargeSent,
  useSendChargeEmail,
} from '@web/features/contacts/api/use-charge-actions'
import {
  chargeEmailPreviewOf,
  chargeMessagePreviewOf,
} from '@web/features/contacts/components/charge-email-view'
import {
  chargeableBy,
  defaultUntilOf,
  nextUntilOf,
} from '@web/features/contacts/components/contact-detail-view'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ChargeComposeFieldsProps,
  ChargeComposeProps,
  ChargeEmailSendProps,
  ChargeMessagePreviewProps,
  ChargePixProps,
  CreatedChargeLayoutProps,
  CreatedChargeProps,
  DialogDismissProps,
  NewChargeProps,
} from '@web/features/contacts/contacts.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatPhone, whatsappLink } from '@web/lib/format/phone'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = contactsMessages.newCharge
const NO_RECEIVER = { name: null, city: null }

export function NewCharge(props: NewChargeProps) {
  const [chargeId, setChargeId] = useState<string | null>(props.chargeId ?? null)
  return chargeId ? (
    <CreatedCharge {...props} chargeId={chargeId} isResend={props.chargeId === chargeId} />
  ) : (
    <ChargeCompose {...props} onCreated={setChargeId} />
  )
}

function ChargeCompose(props: ChargeComposeProps) {
  const { workspaceId, contact, balance, today, openItems, isOpen, onClose, onCreated } = props
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const create = useCreateCharge(workspaceId, contact.id)
  const [until, setUntil] = useState(() => defaultUntilOf(balance, today))
  const hasItems = chargeableBy(openItems, until, today).length > 0
  return (
    <FormOverlay
      title={messages.title}
      closeLabel={messages.close}
      size="split"
      isOpen={isOpen}
      onRequestClose={onClose}
      onSubmit={(event) => {
        event.preventDefault()
        create.mutate(until, {
          onSuccess: ({ chargeId }) => onCreated(chargeId),
          onError: (error) => showToast(errorMessageFor(error), { tone: 'danger' }),
        })
      }}
      footer={
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <DialogDismiss label={messages.close} onPress={onClose} />
          <Button type="submit" isLoading={create.isPending} disabled={!hasItems}>
            {messages.create}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:px-8">
        <ChargeComposeFields {...props} until={until} onUntilChange={setUntil} />
        {isDesktop && hasItems && (
          <ChargeMessagePreviewPanel
            workspaceId={workspaceId}
            contactName={contact.name}
            currentUser={props.currentUser}
            openItems={openItems}
            until={until}
          />
        )}
      </div>
    </FormOverlay>
  )
}

function ChargeComposeFields({
  contact,
  balance,
  openItems,
  today,
  until,
  onUntilChange,
}: ChargeComposeFieldsProps) {
  const next = nextUntilOf(openItems, today)
  const items = chargeableBy(openItems, until, today)
  const totalCents = items.reduce((sum, item) => sum + item.amountCents, 0)
  const owed = formatBrl(balance?.owedCents ?? 0)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-md bg-sunken p-3">
        <Avatar name={contact.name} size="xl" tone="paper" />
        <div className="flex min-w-0 flex-col">
          <span className="line-clamp-2 font-semibold text-body">{contact.name}</span>
          <span className="text-body-sm text-ink-muted">
            {(balance?.overdueCents ?? 0) > 0
              ? messages.owesLate(owed, formatBrl(balance?.overdueCents ?? 0))
              : messages.owes(owed)}
          </span>
        </div>
      </div>
      <UntilChips
        label={messages.until}
        today={today}
        next={next}
        value={until}
        onChange={onUntilChange}
      />
      {items.length > 0 ? (
        <ChargePreview items={items} totalCents={totalCents} />
      ) : (
        <NothingToCharge
          chargedOn={balance?.lastCharge?.createdOn ?? null}
          next={
            next
              ? {
                  dueOn: next.dueOn,
                  amountCents: chargeableBy(openItems, next.dueOn, today).reduce(
                    (sum, item) => sum + item.amountCents,
                    0,
                  ),
                }
              : null
          }
          onIncludeNext={next ? () => onUntilChange(next.dueOn) : undefined}
        />
      )}
    </div>
  )
}

function ChargeMessagePreviewPanel({
  workspaceId,
  contactName,
  currentUser,
  openItems,
  until,
}: ChargeMessagePreviewProps) {
  const text = useQuery(chargeTextQueryOptions(workspaceId)).data ?? DEFAULT_CHARGE_TEXT
  const receiver = useQuery(pixReceiverQueryOptions(workspaceId)).data ?? NO_RECEIVER
  const preview = chargeMessagePreviewOf({
    openItems,
    until,
    contactName,
    sender: currentUser,
    text,
    receiver,
  })
  return (
    <section aria-label={messages.messagePreview} className="flex flex-col gap-2">
      <h2 className="font-medium text-body-sm text-ink-muted">{messages.messagePreview}</h2>
      <MessageBubble message={preview.message} pixPayload={preview.pixPayload} />
      <p className="text-note text-ink-muted">{messages.messageKept}</p>
    </section>
  )
}

function CreatedCharge({
  workspaceId,
  contact,
  permissions,
  currentUser,
  chargeId,
  today,
  isResend,
  isOpen,
  onClose,
}: CreatedChargeProps) {
  const charge = useQuery(chargeQueryOptions(workspaceId, chargeId))
  const markSent = useMarkChargeSent(workspaceId)
  const [isAsking, setIsAsking] = useState(false)
  const [isEmailOpen, setIsEmailOpen] = useState(false)
  const toast = (text: string) => () => showToast(text)
  const email = contact.email
  return (
    <FormOverlay
      title={isResend ? messages.resendTitle : messages.createdTitle}
      closeLabel={messages.done}
      size="split"
      isOpen={isOpen}
      onRequestClose={onClose}
      footer={
        <div className="flex flex-col lg:flex-row lg:justify-end">
          <DialogDismiss label={messages.done} onPress={onClose} />
        </div>
      }
    >
      {charge.data ? (
        <CreatedChargeLayout
          alert={
            !isResend && (
              <Alert tone="success" icon="ok">
                {messages.created(formatBrl(charge.data.amountCents))}
              </Alert>
            )
          }
          send={
            <SendOptions
              contactName={contact.name}
              message={charge.data.messageText}
              whatsapp={
                contact.phoneE164
                  ? {
                      phone: formatPhone(contact.phoneE164),
                      onSend: () => {
                        window.open(
                          whatsappLink(contact.phoneE164 ?? '', charge.data?.messageText),
                          '_blank',
                          'noreferrer',
                        )
                        setIsAsking(true)
                      },
                    }
                  : null
              }
              email={
                email
                  ? {
                      address: email,
                      isOptedOut: contact.isOptedOut,
                      onSend: () => setIsEmailOpen(true),
                    }
                  : null
              }
              onCopied={toast(messages.messageCopied)}
              onCopyFailed={toast(messages.copyFailed)}
            />
          }
          message={
            <section className="flex flex-col gap-2">
              <h2 className="font-medium text-body-sm text-ink-muted">
                {messages.messageAs(contact.name)}
              </h2>
              <MessageBubble
                message={charge.data.messageText}
                pixPayload={charge.data.pixPayload}
              />
              {hasPermission(permissions, 'settings', 'update') && (
                <TextLink
                  className="self-start"
                  render={
                    <Link to="/w/$workspaceId/settings/charge-text" params={{ workspaceId }} />
                  }
                >
                  {messages.changeText}
                </TextLink>
              )}
            </section>
          }
          pix={
            <ChargePix
              workspaceId={workspaceId}
              permissions={permissions}
              amountCents={charge.data.amountCents}
              pixPayload={charge.data.pixPayload}
            />
          }
        />
      ) : (
        <div className="px-4 lg:px-8">
          <ListSkeleton rows={3} />
        </div>
      )}
      {email && charge.data && (
        <ChargeEmailSend
          workspaceId={workspaceId}
          contactName={contact.name}
          currentUser={currentUser}
          charge={charge.data}
          email={email}
          today={today}
          isOpen={isEmailOpen}
          onOpenChange={setIsEmailOpen}
          onSent={onClose}
        />
      )}
      <ConfirmDialog
        title={messages.sentTitle}
        description={messages.sentText}
        cancelLabel={messages.sentLater}
        confirmLabel={messages.sentConfirm}
        confirmVariant="primary"
        isOpen={isAsking}
        onOpenChange={setIsAsking}
        onConfirm={() => {
          setIsAsking(false)
          markSent.mutate(
            { chargeId, via: 'whatsapp' },
            {
              onSuccess: () => {
                showToast(messages.markedSent, { tone: 'success' })
                onClose()
              },
              onError: (error) => showToast(errorMessageFor(error), { tone: 'danger' }),
            },
          )
        }}
      />
    </FormOverlay>
  )
}

function DialogDismiss({ label, onPress }: DialogDismissProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  return isDesktop ? (
    <Button variant="quiet" onClick={onPress}>
      {label}
    </Button>
  ) : (
    <TextLink render={<button type="button" onClick={onPress} />}>{label}</TextLink>
  )
}

function CreatedChargeLayout({ alert, send, message, pix }: CreatedChargeLayoutProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-4 px-4">
        {alert}
        {send}
        {message}
        {pix}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 items-start gap-6 px-8">
      <div className="flex flex-col gap-4">
        {alert}
        {message}
      </div>
      <div className="flex flex-col gap-4">
        {pix}
        {send}
      </div>
    </div>
  )
}

function ChargePix({ workspaceId, permissions, amountCents, pixPayload }: ChargePixProps) {
  if (pixPayload) {
    return (
      <PixBox
        amountCents={amountCents}
        payload={pixPayload}
        onCopied={() => showToast(messages.pixCopied)}
        onCopyFailed={() => showToast(messages.copyFailed)}
      />
    )
  }
  return (
    <Alert tone="info" icon="info">
      {messages.noPix}{' '}
      {hasPermission(permissions, 'settings', 'update') && (
        <TextLink render={<Link to="/w/$workspaceId/settings/pix" params={{ workspaceId }} />}>
          {messages.setUpPix}
        </TextLink>
      )}
    </Alert>
  )
}

function ChargeEmailSend({
  workspaceId,
  contactName,
  currentUser,
  charge,
  email,
  today,
  isOpen,
  onOpenChange,
  onSent,
}: ChargeEmailSendProps) {
  const text = useQuery(chargeTextQueryOptions(workspaceId)).data ?? DEFAULT_CHARGE_TEXT
  const receiver = useQuery(pixReceiverQueryOptions(workspaceId)).data ?? NO_RECEIVER
  const sendEmail = useSendChargeEmail(workspaceId)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const preview = chargeEmailPreviewOf({
    charge,
    contactName,
    sender: currentUser,
    text,
    receiver,
    today,
  })
  return (
    <>
      <EmailSendSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        to={email}
        subject={preview.subject}
        replyTo={{ name: currentUser.name, email: currentUser.email }}
        hasPix={charge.pixPayload !== null}
        isSending={sendEmail.isPending}
        onPreview={() => setIsPreviewOpen(true)}
        onSend={() =>
          sendEmail.mutate(charge.id, {
            onSuccess: () => {
              onOpenChange(false)
              showToast(messages.emailSent(email), { tone: 'success' })
              onSent()
            },
            onError: (error) => showToast(errorMessageFor(error), { tone: 'danger' }),
          })
        }
      />
      <Sheet
        title={messages.emailPreviewTitle}
        closeLabel={messages.emailPreviewClose}
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      >
        <ChargeEmailPreview {...preview} />
      </Sheet>
    </>
  )
}

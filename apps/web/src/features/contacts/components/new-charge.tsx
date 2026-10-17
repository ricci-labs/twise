import { chargeSubject, DEFAULT_CHARGE_TEXT, formatBrl, type IsoDate } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { Avatar } from '@web/components/display/avatar'
import { Alert } from '@web/components/feedback/alert'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { ChargePreview } from '@web/components/finance/charge-preview'
import { EmailSendSheet } from '@web/components/finance/email-send-sheet'
import { MessageBubble } from '@web/components/finance/message-bubble'
import { NothingToCharge } from '@web/components/finance/nothing-to-charge'
import { PixBox } from '@web/components/finance/pix-box'
import { SendOptions } from '@web/components/finance/send-options'
import { UntilChips } from '@web/components/finance/until-chips'
import { FormOverlay } from '@web/components/layout/form-overlay'
import {
  chargeQueryOptions,
  chargeTextQueryOptions,
} from '@web/features/contacts/api/contacts.queries'
import {
  useCreateCharge,
  useMarkChargeSent,
  useSendChargeEmail,
} from '@web/features/contacts/api/use-charge-actions'
import {
  chargeableBy,
  defaultUntilOf,
  nextUntilOf,
} from '@web/features/contacts/components/contact-detail-view'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ChargeComposeProps,
  ChargeEmailSendProps,
  ChargePixProps,
  CreatedChargeProps,
  NewChargeProps,
} from '@web/features/contacts/contacts.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatPhone, whatsappLink } from '@web/lib/format/phone'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = contactsMessages.newCharge

export function NewCharge(props: NewChargeProps) {
  const [chargeId, setChargeId] = useState<string | null>(props.chargeId ?? null)
  return chargeId ? (
    <CreatedCharge {...props} chargeId={chargeId} isResend={props.chargeId === chargeId} />
  ) : (
    <ChargeCompose {...props} onCreated={setChargeId} />
  )
}

function ChargeCompose({
  workspaceId,
  contact,
  balance,
  openItems,
  today,
  isOpen,
  onClose,
  onCreated,
}: ChargeComposeProps) {
  const create = useCreateCharge(workspaceId, contact.id)
  const [until, setUntil] = useState(() => defaultUntilOf(balance, today))
  const next = nextUntilOf(openItems, today)
  const items = chargeableBy(openItems, until, today)
  const totalCents = items.reduce((sum, item) => sum + item.amountCents, 0)
  const owed = formatBrl(balance?.owedCents ?? 0)
  return (
    <FormOverlay
      title={messages.title}
      closeLabel={messages.close}
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
        <>
          <TextLink render={<button type="button" onClick={onClose} />}>{messages.close}</TextLink>
          <Button type="submit" isLoading={create.isPending} disabled={items.length === 0}>
            {messages.create}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 px-4 lg:px-8">
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
          onChange={setUntil}
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
            onIncludeNext={next ? () => setUntil(next.dueOn) : undefined}
          />
        )}
      </div>
    </FormOverlay>
  )
}

function CreatedCharge({
  workspaceId,
  contact,
  permissions,
  currentUser,
  chargeId,
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
      isOpen={isOpen}
      onRequestClose={onClose}
      footer={
        <TextLink render={<button type="button" onClick={onClose} />}>{messages.done}</TextLink>
      }
    >
      {charge.data ? (
        <div className="flex flex-col gap-4 px-4 lg:px-8">
          {!isResend && (
            <Alert tone="success" icon="ok">
              {messages.created(formatBrl(charge.data.amountCents))}
            </Alert>
          )}
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
          <section className="flex flex-col gap-2">
            <h2 className="font-medium text-body-sm text-ink-muted">
              {messages.messageAs(contact.name)}
            </h2>
            <MessageBubble message={charge.data.messageText} pixPayload={charge.data.pixPayload} />
          </section>
          <ChargePix
            workspaceId={workspaceId}
            permissions={permissions}
            amountCents={charge.data.amountCents}
            pixPayload={charge.data.pixPayload}
          />
        </div>
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
          chargeId={chargeId}
          email={email}
          amountCents={charge.data.amountCents}
          dueOn={charge.data.dueOn as IsoDate | null}
          hasPix={charge.data.pixPayload !== null}
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
  chargeId,
  email,
  amountCents,
  dueOn,
  hasPix,
  isOpen,
  onOpenChange,
  onSent,
}: ChargeEmailSendProps) {
  const chargeText = useQuery(chargeTextQueryOptions(workspaceId))
  const sendEmail = useSendChargeEmail(workspaceId)
  return (
    <EmailSendSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      to={email}
      subject={chargeSubject((chargeText.data ?? DEFAULT_CHARGE_TEXT).subject, {
        contactName,
        requesterName: currentUser.name,
        workspaceName: currentUser.workspaceName,
        totalCents: amountCents,
        dueOn,
      })}
      replyTo={{ name: currentUser.name, email: currentUser.email }}
      hasPix={hasPix}
      isSending={sendEmail.isPending}
      onSend={() =>
        sendEmail.mutate(chargeId, {
          onSuccess: () => {
            onOpenChange(false)
            showToast(messages.emailSent(email), { tone: 'success' })
            onSent()
          },
          onError: (error) => showToast(errorMessageFor(error), { tone: 'danger' }),
        })
      }
    />
  )
}

import { formatBrl } from '@financas/shared'
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
import { MessageBubble } from '@web/components/finance/message-bubble'
import { NothingToCharge } from '@web/components/finance/nothing-to-charge'
import { PixBox } from '@web/components/finance/pix-box'
import { SendOptions } from '@web/components/finance/send-options'
import { UntilChips } from '@web/components/finance/until-chips'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { chargeQueryOptions } from '@web/features/contacts/api/contacts.queries'
import { useCreateCharge, useMarkChargeSent } from '@web/features/contacts/api/use-charge-actions'
import {
  chargeableBy,
  defaultUntilOf,
  nextUntilOf,
} from '@web/features/contacts/components/contact-detail-view'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ChargeComposeProps,
  CreatedChargeProps,
  NewChargeProps,
} from '@web/features/contacts/contacts.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatPhone, whatsappLink } from '@web/lib/format/phone'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = contactsMessages.newCharge

export function NewCharge(props: NewChargeProps) {
  const [chargeId, setChargeId] = useState<string | null>(null)
  return chargeId ? (
    <CreatedCharge {...props} chargeId={chargeId} />
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
  chargeId,
  isOpen,
  onClose,
}: CreatedChargeProps) {
  const charge = useQuery(chargeQueryOptions(workspaceId, chargeId))
  const markSent = useMarkChargeSent(workspaceId)
  const [isAsking, setIsAsking] = useState(false)
  const toast = (text: string) => () => showToast(text)
  return (
    <FormOverlay
      title={messages.createdTitle}
      closeLabel={messages.done}
      isOpen={isOpen}
      onRequestClose={onClose}
      footer={
        <TextLink render={<button type="button" onClick={onClose} />}>{messages.done}</TextLink>
      }
    >
      {charge.data ? (
        <div className="flex flex-col gap-4 px-4 lg:px-8">
          <Alert tone="success" icon="ok">
            {messages.created(formatBrl(charge.data.amountCents))}
          </Alert>
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
            onCopied={toast(messages.messageCopied)}
            onCopyFailed={toast(messages.copyFailed)}
          />
          <section className="flex flex-col gap-2">
            <h2 className="font-medium text-body-sm text-ink-muted">
              {messages.messageAs(contact.name)}
            </h2>
            <MessageBubble message={charge.data.messageText} pixPayload={charge.data.pixPayload} />
          </section>
          {charge.data.pixPayload ? (
            <PixBox
              amountCents={charge.data.amountCents}
              payload={charge.data.pixPayload}
              onCopied={toast(messages.pixCopied)}
              onCopyFailed={toast(messages.copyFailed)}
            />
          ) : (
            <Alert tone="info" icon="info">
              {messages.noPix}{' '}
              {hasPermission(permissions, 'settings', 'update') && (
                <TextLink
                  render={<Link to="/w/$workspaceId/settings/pix" params={{ workspaceId }} />}
                >
                  {messages.setUpPix}
                </TextLink>
              )}
            </Alert>
          )}
        </div>
      ) : (
        <div className="px-4 lg:px-8">
          <ListSkeleton rows={3} />
        </div>
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

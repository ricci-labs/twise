import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ListSection } from '@web/components/display/list-section'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { showToast } from '@web/components/feedback/toast'
import {
  type ChargeAction,
  ChargeBody,
  type ChargeBodyProps,
} from '@web/components/finance/charge-body'
import { ChargeRow } from '@web/components/finance/charge-row'
import { MessageBubble } from '@web/components/finance/message-bubble'
import {
  contactChargesQueryOptions,
  moneyAccountsQueryOptions,
} from '@web/features/contacts/api/contacts.queries'
import { useCancelCharge } from '@web/features/contacts/api/use-cancel-charge'
import { useSendChargeEmail } from '@web/features/contacts/api/use-charge-actions'
import { ChargePaymentSheet } from '@web/features/contacts/components/charge-payment-sheet'
import { contactChargeViewOf } from '@web/features/contacts/components/contact-detail-view'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ChargeActionsInput,
  ContactChargeItemProps,
  ContactChargesProps,
  ContactChargeView,
} from '@web/features/contacts/contacts.types'
import { ApiError } from '@web/lib/api/api-error'
import { copyText } from '@web/lib/clipboard'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useState } from 'react'

const messages = contactsMessages.detail
const newChargeMessages = contactsMessages.newCharge
const TIME_ZONE = 'America/Sao_Paulo'
const LOADING_ROWS = 2

export function ContactCharges({
  workspaceId,
  contactId,
  canUpdate,
  today,
  contactName,
  onResend,
}: ContactChargesProps) {
  const charges = useQuery(contactChargesQueryOptions(workspaceId, contactId))
  const accounts = useQuery(moneyAccountsQueryOptions(workspaceId)).data ?? []
  const cancel = useCancelCharge(workspaceId)
  const sendEmail = useSendChargeEmail(workspaceId)
  const navigate = useNavigate()
  const [openId, setOpenId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<ContactChargeView | null>(null)
  const [paying, setPaying] = useState<ContactChargeView | null>(null)
  if (charges.isError) {
    return (
      <ListSection title={messages.charges}>
        <SectionError
          message={messages.failed}
          errorRef={charges.error instanceof ApiError ? charges.error.ref : null}
          isRetrying={charges.isFetching}
          onRetry={() => void charges.refetch()}
        />
      </ListSection>
    )
  }
  if (!charges.data) {
    return (
      <ListSection title={messages.charges}>
        <ListSkeleton rows={LOADING_ROWS} />
      </ListSection>
    )
  }
  const accountNames = new Map(accounts.map((account) => [account.id, account.name]))
  const views = charges.data.map((charge) =>
    contactChargeViewOf(charge, today, TIME_ZONE, accountNames),
  )
  return (
    <ListSection
      title={messages.charges}
      aside={views.length > 0 ? String(views.length) : undefined}
      empty={views.length === 0 ? messages.chargesEmpty : undefined}
    >
      <ul className="flex flex-col rounded-xl border border-border bg-surface px-3.5">
        {views.map((charge) => (
          <ContactChargeItem
            key={charge.id}
            charge={charge}
            canUpdate={canUpdate}
            isOpen={openId === charge.id}
            onOpenChange={(isOpen) => setOpenId(isOpen ? charge.id : null)}
            onCancel={() => setCancelling(charge)}
            onResend={() => onResend(charge.id)}
            onRetryEmail={() =>
              sendEmail.mutate(charge.id, {
                onSuccess: () =>
                  showToast(newChargeMessages.emailSent(charge.sentTo ?? ''), { tone: 'success' }),
                onError: (error) => showToast(errorMessageFor(error), { tone: 'danger' }),
              })
            }
            onPay={() => setPaying(charge)}
            onFixEmail={() =>
              void navigate({
                to: '.',
                search: (previous) => ({ ...previous, contact: contactId }),
              })
            }
          />
        ))}
      </ul>
      <ChargePaymentSheet
        workspaceId={workspaceId}
        contactName={contactName}
        charge={paying}
        today={today}
        onOpenChange={(isOpen) => !isOpen && setPaying(null)}
      />
      <ConfirmDialog
        title={messages.cancelTitle}
        description={messages.cancelText}
        cancelLabel={messages.cancelKeep}
        confirmLabel={messages.cancelConfirm}
        confirmVariant="danger"
        isOpen={cancelling !== null}
        onOpenChange={(isOpen) => !isOpen && setCancelling(null)}
        onConfirm={() => {
          if (!cancelling) {
            return
          }
          cancel.mutate(cancelling.id, {
            onSuccess: () => showToast(messages.cancelled, { tone: 'success' }),
            onError: (error) => showToast(errorMessageFor(error), { tone: 'danger' }),
          })
          setCancelling(null)
        }}
      />
    </ListSection>
  )
}

function ContactChargeItem({
  charge,
  canUpdate,
  isOpen,
  onOpenChange,
  onCancel,
  onResend,
  onRetryEmail,
  onFixEmail,
  onPay,
}: ContactChargeItemProps) {
  const copy = async (text: string, done: string) => {
    showToast((await copyText(text)) ? done : messages.copyFailed)
  }
  const copyMessage = () => void copy(charge.messageText, messages.messageCopied)
  const pixPayload = charge.pixPayload
  return (
    <ChargeRow
      createdOn={charge.createdOn}
      amountCents={charge.amountCents}
      status={charge.status}
      itemCount={charge.itemCount}
      sentVia={charge.sentVia}
      hasEmailFailed={charge.hasEmailFailed}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      actions={
        canUpdate
          ? [
              { key: 'message', label: messages.copyMessage, icon: 'list', onSelect: copyMessage },
              ...(charge.canCancel
                ? [
                    {
                      key: 'cancel',
                      label: messages.cancelCharge,
                      icon: 'trash' as const,
                      tone: 'danger' as const,
                      onSelect: onCancel,
                    },
                  ]
                : []),
            ]
          : undefined
      }
    >
      <ChargeBody
        history={charge.history}
        items={charge.items}
        totalCents={charge.amountCents}
        dueOn={charge.dueOn}
        isDuePast={charge.isDuePast}
        message={<MessageBubble message={charge.messageText} pixPayload={pixPayload} />}
        {...chargeActionsOf({
          charge,
          canUpdate,
          copyMessage,
          copyPix: pixPayload ? () => void copy(pixPayload, messages.pixCopied) : null,
          onResend,
          onRetryEmail,
          onFixEmail,
          onPay,
        })}
      />
    </ChargeRow>
  )
}

function chargeActionsOf({
  charge,
  canUpdate,
  copyMessage,
  copyPix,
  onResend,
  onRetryEmail,
  onFixEmail,
  onPay,
}: ChargeActionsInput): Pick<ChargeBodyProps, 'primaryAction' | 'actions'> {
  const pix: ChargeAction[] = copyPix
    ? [{ key: 'pix', label: messages.copyPix, icon: 'pix', onPress: copyPix }]
    : []
  if (canUpdate && charge.hasEmailFailed && charge.isOpen) {
    return {
      primaryAction: {
        key: 'retry',
        label: messages.retryEmail,
        icon: 'retry',
        onPress: onRetryEmail,
      },
      actions: [
        { key: 'whatsapp', label: messages.byWhatsApp, icon: 'whatsapp', onPress: onResend },
        { key: 'fix', label: messages.fixEmail, icon: 'edit', onPress: onFixEmail },
      ],
    }
  }
  if (canUpdate && charge.isOpen) {
    return {
      primaryAction: { key: 'pay', label: messages.pay, icon: 'payment', onPress: onPay },
      actions: [{ key: 'resend', label: messages.resend, icon: 'send', onPress: onResend }, ...pix],
    }
  }
  return {
    actions: [{ key: 'message', label: messages.copyMessage, onPress: copyMessage }, ...pix],
  }
}

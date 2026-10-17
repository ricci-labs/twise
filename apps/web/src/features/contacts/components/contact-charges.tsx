import { useQuery } from '@tanstack/react-query'
import { ListSection } from '@web/components/display/list-section'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { showToast } from '@web/components/feedback/toast'
import { ChargeBody } from '@web/components/finance/charge-body'
import { ChargeRow } from '@web/components/finance/charge-row'
import { MessageBubble } from '@web/components/finance/message-bubble'
import { contactChargesQueryOptions } from '@web/features/contacts/api/contacts.queries'
import { useCancelCharge } from '@web/features/contacts/api/use-cancel-charge'
import { contactChargeViewOf } from '@web/features/contacts/components/contact-detail-view'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ContactChargeItemProps,
  ContactChargesProps,
  ContactChargeView,
} from '@web/features/contacts/contacts.types'
import { ApiError } from '@web/lib/api/api-error'
import { copyText } from '@web/lib/clipboard'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useState } from 'react'

const messages = contactsMessages.detail
const TIME_ZONE = 'America/Sao_Paulo'
const LOADING_ROWS = 2

export function ContactCharges({ workspaceId, contactId, canUpdate, today }: ContactChargesProps) {
  const charges = useQuery(contactChargesQueryOptions(workspaceId, contactId))
  const cancel = useCancelCharge(workspaceId)
  const [openId, setOpenId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<ContactChargeView | null>(null)
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
  const views = charges.data.map((charge) => contactChargeViewOf(charge, today, TIME_ZONE))
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
          />
        ))}
      </ul>
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
        actions={[
          { key: 'message', label: messages.copyMessage, onPress: copyMessage },
          ...(pixPayload
            ? [
                {
                  key: 'pix',
                  label: messages.copyPix,
                  icon: 'pix' as const,
                  onPress: () => void copy(pixPayload, messages.pixCopied),
                },
              ]
            : []),
        ]}
      />
    </ChargeRow>
  )
}

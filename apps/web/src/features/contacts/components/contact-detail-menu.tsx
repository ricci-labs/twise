import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { type ItemAction, ItemActions } from '@web/components/actions/item-actions'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { showToast } from '@web/components/feedback/toast'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { useChangeContact, useDeleteContact } from '@web/features/contacts/api/use-contact-actions'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ContactDetailMenuProps,
  ContactEditLinkProps,
  ContactMenuDialog,
} from '@web/features/contacts/contacts.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = contactsMessages.detail

export function ContactDetailMenu({
  workspaceId,
  contact,
  owedCents,
  permissions,
  onNewCharge,
  onDeleted,
}: ContactDetailMenuProps) {
  const change = useChangeContact(workspaceId, contact.id)
  const remove = useDeleteContact(workspaceId, contact.id)
  const [dialog, setDialog] = useState<ContactMenuDialog>(null)
  const canUpdate = hasPermission(permissions, 'contacts', 'update')
  const canDelete = hasPermission(permissions, 'contacts', 'delete')
  if (!canUpdate && !canDelete) {
    return null
  }
  const save = (patch: Parameters<typeof change.mutate>[0], done: string) =>
    change.mutate(patch, {
      onSuccess: () => showToast(done, { tone: 'success' }),
      onError: (error) => showToast(errorMessageFor(error), { tone: 'danger' }),
    })
  const amount = formatBrl(Math.abs(owedCents))
  const actions: ItemAction[] = [
    ...(canUpdate
      ? [
          {
            key: 'edit',
            label: messages.editAction,
            icon: 'edit' as const,
            render: <Link to="." search={(previous) => ({ ...previous, contact: contact.id })} />,
          },
          {
            key: 'opt-out',
            label: messages.optOut,
            icon: 'messageOff' as const,
            toggle: { isOn: contact.isOptedOut, help: messages.optOutHelp },
            onSelect: () =>
              save(
                { isOptedOut: !contact.isOptedOut },
                contact.isOptedOut ? messages.optedIn : messages.optedOut,
              ),
          },
          contact.isArchived
            ? {
                key: 'unarchive',
                label: messages.unarchive,
                icon: 'unarchive' as const,
                onSelect: () => save({ isArchived: false }, messages.unarchived),
              }
            : {
                key: 'archive',
                label: messages.archive,
                icon: 'archive' as const,
                onSelect: () =>
                  owedCents === 0
                    ? save({ isArchived: true }, messages.archived)
                    : setDialog('archive'),
              },
        ]
      : []),
    ...(canDelete
      ? [
          {
            key: 'delete',
            label: messages.remove,
            icon: 'trash' as const,
            tone: 'danger' as const,
            onSelect: () => setDialog('delete'),
          },
        ]
      : []),
  ]
  return (
    <>
      {canUpdate && <ContactEditLink contactId={contact.id} />}
      <ItemActions
        title={contact.name}
        triggerLabel={messages.actions(contact.name)}
        actions={actions}
      />
      <ConfirmDialog
        title={messages.cantArchive(contact.name)}
        description={
          owedCents > 0
            ? messages.cantArchiveOwes(contact.name, amount)
            : messages.cantArchiveCredit(contact.name, amount)
        }
        cancelLabel={messages.cantArchiveKeep}
        confirmLabel={owedCents > 0 ? messages.newCharge : messages.cantArchiveOk}
        confirmVariant="primary"
        isOpen={dialog === 'archive'}
        onOpenChange={(isOpen) => !isOpen && setDialog(null)}
        onConfirm={() => {
          setDialog(null)
          if (owedCents > 0) {
            onNewCharge()
          }
        }}
      />
      <ConfirmDialog
        title={messages.removeTitle(contact.name)}
        description={
          owedCents > 0 ? messages.removeOwes(contact.name, amount) : messages.removeText
        }
        cancelLabel={messages.removeKeep}
        confirmLabel={messages.remove}
        confirmIcon="trash"
        isOpen={dialog === 'delete'}
        onOpenChange={(isOpen) => !isOpen && setDialog(null)}
        onConfirm={() => {
          setDialog(null)
          remove.mutate(undefined, {
            onSuccess: () => {
              showToast(messages.removed, { tone: 'success' })
              onDeleted()
            },
            onError: (error) => showToast(errorMessageFor(error), { tone: 'danger' }),
          })
        }}
      />
    </>
  )
}

function ContactEditLink({ contactId }: ContactEditLinkProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const link = <Link to="." search={(previous) => ({ ...previous, contact: contactId })} />
  if (isDesktop) {
    return (
      <Button variant="secondary" render={link}>
        <TwiseIcon name="edit" size="md" />
        {messages.editButton}
      </Button>
    )
  }
  return (
    <Link
      to="."
      search={(previous) => ({ ...previous, contact: contactId })}
      aria-label={messages.edit}
      className="grid size-touch place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring"
    >
      <TwiseIcon name="edit" />
    </Link>
  )
}

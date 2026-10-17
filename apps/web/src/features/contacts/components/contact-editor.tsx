import { useQuery } from '@tanstack/react-query'
import { showToast } from '@web/components/feedback/toast'
import { contactQueryOptions } from '@web/features/contacts/api/contacts.queries'
import { ContactForm } from '@web/features/contacts/components/contact-form'
import type { ChangeContactProps, ContactEditorProps } from '@web/features/contacts/contacts.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { hasPermission } from '@web/lib/permissions'
import { useEffect, useRef } from 'react'

const NEW_CONTACT = 'new'

export function ContactEditor(props: ContactEditorProps) {
  const { param, permissions } = props
  if (param === NEW_CONTACT) {
    return hasPermission(permissions, 'contacts', 'create') ? (
      <ContactForm {...props} contact={null} />
    ) : null
  }
  if (!param || !hasPermission(permissions, 'contacts', 'update')) {
    return null
  }
  return <ChangeContact {...props} contactId={param} />
}

function ChangeContact({ workspaceId, contactId, onClose, onCreated }: ChangeContactProps) {
  const { data: contact, error } = useQuery(contactQueryOptions(workspaceId, contactId))
  const hasClosed = useRef(false)

  useEffect(() => {
    if (!error || hasClosed.current) {
      return
    }
    hasClosed.current = true
    showToast(errorMessageFor(error), { tone: 'danger' })
    onClose()
  }, [error, onClose])

  if (!contact) {
    return null
  }
  return (
    <ContactForm
      key={contact.id}
      workspaceId={workspaceId}
      contact={contact}
      onClose={onClose}
      onCreated={onCreated}
    />
  )
}

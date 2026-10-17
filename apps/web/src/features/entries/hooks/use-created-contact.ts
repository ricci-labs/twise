import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

const CONTACT_FOR_FORM = 'form'

export function useNewContactForm() {
  const navigate = useNavigate()
  return () =>
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, contact: 'new', contactFor: CONTACT_FOR_FORM }),
    })
}

export function useCreatedContact(onCreated: (contactId: string) => void) {
  const navigate = useNavigate()
  const { createdContact } = useSearch({ strict: false })
  const handled = useRef<string | null>(null)

  useEffect(() => {
    if (!createdContact || handled.current === createdContact) {
      return
    }
    handled.current = createdContact
    onCreated(createdContact)
    void navigate({ to: '.', search: (previous) => ({ ...previous, createdContact: undefined }) })
  }, [createdContact, navigate, onCreated])
}

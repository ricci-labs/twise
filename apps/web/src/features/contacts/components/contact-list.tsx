import { ContactRow } from '@web/components/finance/contact-row'
import { contactLink } from '@web/features/contacts/components/contact-links'
import type { ContactListProps } from '@web/features/contacts/contacts.types'

export function ContactList({ workspaceId, label, contacts, onCharge }: ContactListProps) {
  return (
    <ul aria-label={label} className="rounded-xl border border-border bg-surface px-3.5">
      {contacts.map((contact) => (
        <ContactRow
          key={contact.id}
          name={contact.name}
          owedCents={contact.owedCents}
          overdueCents={contact.overdueCents}
          overdueSince={contact.overdueSince}
          nextDueOn={contact.nextDueOn}
          nextDueCents={contact.nextDueCents}
          chargedOn={contact.chargedOn}
          isOptedOut={contact.isOptedOut}
          isArchived={contact.isArchived}
          channels={contact.channels}
          link={contactLink(workspaceId, contact.id)}
          onCharge={onCharge && contact.hasDueToCharge ? () => onCharge(contact.id) : undefined}
        />
      ))}
    </ul>
  )
}

import { formatBrl } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { ListSection } from '@web/components/display/list-section'
import { showToast } from '@web/components/feedback/toast'
import { ContactChannelRow, ContactChannels } from '@web/components/finance/contact-channels'
import { OccurrenceGroup } from '@web/components/finance/occurrence-group'
import { OpenItemRow } from '@web/components/finance/open-item-row'
import {
  openItemDetail,
  openItemTitle,
} from '@web/features/contacts/components/contact-detail-view'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ContactOpenSectionProps,
  ContactTalkToProps,
} from '@web/features/contacts/contacts.types'
import { copyText } from '@web/lib/clipboard'
import { formatPhone, whatsappLink } from '@web/lib/format/phone'
import { Copy, ExternalLink } from 'lucide-react'

const messages = contactsMessages.detail

export function ContactOpenSection({ owedCents, items }: ContactOpenSectionProps) {
  const isEmpty = items.overdue.length === 0 && items.upcoming.length === 0
  return (
    <ListSection
      title={messages.open}
      aside={isEmpty ? undefined : formatBrl(owedCents)}
      empty={isEmpty ? messages.openEmpty : undefined}
    >
      {[
        { key: 'overdue', title: messages.overdueGroup, list: items.overdue, isOverdue: true },
        { key: 'upcoming', title: messages.upcomingGroup, list: items.upcoming, isOverdue: false },
      ]
        .filter((group) => group.list.length > 0)
        .map((group) => (
          <OccurrenceGroup key={group.key} title={group.title} heading="label">
            {group.list.map((item) => (
              <OpenItemRow
                key={item.postingId}
                dueOn={item.effectiveOn}
                description={openItemTitle(item)}
                detail={openItemDetail(item)}
                amountCents={item.remainingCents}
                isOverdue={group.isOverdue && item.inChargeId === null}
                chargedOn={item.inChargeCreatedOn}
              />
            ))}
          </OccurrenceGroup>
        ))}
    </ListSection>
  )
}

export function ContactTalkTo({ contact }: ContactTalkToProps) {
  const copyPixKey = async (key: string) => {
    showToast((await copyText(key)) ? messages.pixKeyCopied : messages.copyFailed)
  }
  return (
    <ListSection title={messages.talkTo(contact.name)}>
      <ContactChannels>
        <ContactChannelRow
          kind="whatsapp"
          label={messages.whatsapp}
          value={contact.phoneE164 ? formatPhone(contact.phoneE164) : messages.noPhone}
          tone={contact.phoneE164 ? undefined : 'missing'}
          action={
            contact.phoneE164 && (
              <Button
                variant="secondary"
                size="sm"
                aria-label={messages.openWhatsAppLabel(contact.name)}
                render={
                  <a href={whatsappLink(contact.phoneE164)} target="_blank" rel="noreferrer" />
                }
              >
                <ExternalLink aria-hidden="true" />
                {messages.openWhatsApp}
              </Button>
            )
          }
        />
        {contact.email && (
          <ContactChannelRow kind="email" label={messages.email} value={contact.email} />
        )}
        {contact.pixKey && (
          <ContactChannelRow
            kind="pix"
            label={messages.pixKey(contact.name)}
            value={contact.pixKey}
            action={
              <Button
                variant="quiet"
                size="icon"
                aria-label={messages.copyPixKey}
                onClick={() => contact.pixKey && void copyPixKey(contact.pixKey)}
              >
                <Copy aria-hidden="true" />
              </Button>
            }
          />
        )}
        {contact.notes && (
          <ContactChannelRow
            kind="notes"
            label={messages.notes}
            value={contact.notes}
            tone="note"
          />
        )}
      </ContactChannels>
    </ListSection>
  )
}

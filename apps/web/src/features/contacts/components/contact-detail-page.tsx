import { formatBrl, type IsoDate, todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { ListSection } from '@web/components/display/list-section'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { showToast } from '@web/components/feedback/toast'
import { ContactChannelRow, ContactChannels } from '@web/components/finance/contact-channels'
import { ContactHeader } from '@web/components/finance/contact-header'
import { OccurrenceGroup } from '@web/components/finance/occurrence-group'
import { OpenItemRow } from '@web/components/finance/open-item-row'
import { PlanSummaryTiles } from '@web/components/finance/plan-summary-tiles'
import { PageFrame } from '@web/components/layout/page-frame'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import {
  contactBalancesQueryOptions,
  contactOpenItemsQueryOptions,
  contactQueryOptions,
} from '@web/features/contacts/api/contacts.queries'
import { ContactCharges } from '@web/features/contacts/components/contact-charges'
import { ContactDetailMenu } from '@web/features/contacts/components/contact-detail-menu'
import {
  contactTilesOf,
  hasSomethingToCharge,
  openItemDetail,
  openItemsByDue,
} from '@web/features/contacts/components/contact-detail-view'
import { NewCharge } from '@web/features/contacts/components/new-charge'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ContactDetailActionsProps,
  ContactDetailBodyProps,
  ContactDetailFrameProps,
  ContactDetailPageProps,
  ContactOpenSectionProps,
  ContactTalkToProps,
} from '@web/features/contacts/contacts.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { copyText } from '@web/lib/clipboard'
import { formatPhone, whatsappLink } from '@web/lib/format/phone'
import { hasPermission } from '@web/lib/permissions'
import { Copy, ExternalLink, Send } from 'lucide-react'

const messages = contactsMessages.detail
const NOT_FOUND = 'CONTACT_NOT_FOUND'
const TIME_ZONE = 'America/Sao_Paulo'
const LOADING_ROWS = 4
const NEW_CHARGE = 'new'

export function ContactDetailPage(props: ContactDetailPageProps) {
  usePageTitle(messages.pageTitle)
  const { workspaceId, contactId } = props
  const contact = useQuery(contactQueryOptions(workspaceId, contactId))
  const balances = useQuery(contactBalancesQueryOptions(workspaceId))
  const openItems = useQuery(contactOpenItemsQueryOptions(workspaceId, contactId))
  if (contact.error instanceof ApiError && contact.error.code === NOT_FOUND) {
    return (
      <ContactDetailFrame workspaceId={workspaceId}>
        <EmptyBlock
          icon="together"
          title={messages.notFound}
          text={messages.notFoundText}
          action={
            <Button
              variant="secondary"
              render={<Link to="/w/$workspaceId/contacts" params={{ workspaceId }} />}
            >
              {messages.backToList}
            </Button>
          }
        />
      </ContactDetailFrame>
    )
  }
  const failed = [contact, balances, openItems].find((query) => query.isError)
  if (failed) {
    return (
      <ContactDetailFrame workspaceId={workspaceId}>
        <SectionError
          message={messages.failed}
          errorRef={failed.error instanceof ApiError ? failed.error.ref : null}
          isRetrying={failed.isFetching}
          onRetry={() => void failed.refetch()}
        />
      </ContactDetailFrame>
    )
  }
  if (!contact.data || !balances.data || !openItems.data) {
    return (
      <ContactDetailFrame workspaceId={workspaceId}>
        <ListSkeleton rows={LOADING_ROWS} art="circle" />
      </ContactDetailFrame>
    )
  }
  return (
    <ContactDetailBody
      {...props}
      contact={contact.data}
      balance={balances.data.find((balance) => balance.contactId === contactId)}
      openItems={openItems.data}
      today={todayIn(TIME_ZONE, new Date()) as IsoDate}
    />
  )
}

function ContactDetailFrame({ workspaceId, actions, children }: ContactDetailFrameProps) {
  return (
    <PageFrame className="gap-4 lg:gap-5">
      <SubPageHeader
        title={messages.title}
        actions={actions}
        backLabel={messages.back}
        back={<Link to="/w/$workspaceId/contacts" params={{ workspaceId }} />}
      />
      {children}
    </PageFrame>
  )
}

function ContactDetailBody({
  workspaceId,
  permissions,
  contact,
  balance,
  openItems,
  today,
  onNewCharge,
  onDeleted,
  charge,
  currentUser,
  onChargeOpen,
  onChargeClose,
}: ContactDetailBodyProps) {
  const owedCents = balance?.owedCents ?? 0
  const items = openItemsByDue(openItems, today)
  return (
    <ContactDetailFrame
      workspaceId={workspaceId}
      actions={
        <ContactDetailMenu
          workspaceId={workspaceId}
          contact={contact}
          owedCents={owedCents}
          permissions={permissions}
          onNewCharge={onNewCharge}
          onDeleted={onDeleted}
        />
      }
    >
      <ContactHeader
        name={contact.name}
        owedCents={owedCents}
        hasUpcoming={items.upcoming.length > 0}
        isOptedOut={contact.isOptedOut}
      />
      {balance && owedCents > 0 && (
        <PlanSummaryTiles label={messages.tilesLabel} tiles={contactTilesOf(balance)} />
      )}
      <ContactDetailActions
        contactId={contact.id}
        canCharge={
          hasPermission(permissions, 'contacts', 'create') && hasSomethingToCharge(balance)
        }
        canRecordReceipt={hasPermission(permissions, 'entries', 'create') && owedCents > 0}
        onNewCharge={onNewCharge}
      />
      <ContactOpenSection owedCents={owedCents} items={items} />
      <ContactCharges
        workspaceId={workspaceId}
        contactId={contact.id}
        canUpdate={hasPermission(permissions, 'contacts', 'update')}
        today={today}
        onResend={onChargeOpen}
      />
      <ContactTalkTo contact={contact} />
      {charge &&
        hasPermission(permissions, 'contacts', charge === NEW_CHARGE ? 'create' : 'update') && (
          <NewCharge
            key={charge}
            chargeId={charge === NEW_CHARGE ? undefined : charge}
            currentUser={currentUser}
            workspaceId={workspaceId}
            contact={contact}
            balance={balance}
            openItems={openItems}
            today={today}
            permissions={permissions}
            isOpen
            onClose={onChargeClose}
          />
        )}
    </ContactDetailFrame>
  )
}

function ContactDetailActions({
  contactId,
  canCharge,
  canRecordReceipt,
  onNewCharge,
}: ContactDetailActionsProps) {
  if (!canCharge && !canRecordReceipt) {
    return null
  }
  return (
    <div className="flex flex-col items-center gap-3">
      {canCharge && (
        <Button className="w-full" onClick={onNewCharge}>
          <Send aria-hidden="true" />
          {messages.newCharge}
        </Button>
      )}
      {canRecordReceipt && (
        <TextLink
          render={
            <Link
              to="."
              search={(previous) => ({
                ...previous,
                entry: 'new' as const,
                entryType: 'settlement' as const,
                entryContact: contactId,
              })}
            />
          }
        >
          {messages.receipt}
        </TextLink>
      )}
    </div>
  )
}

function ContactOpenSection({ owedCents, items }: ContactOpenSectionProps) {
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
                description={item.description}
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

function ContactTalkTo({ contact }: ContactTalkToProps) {
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

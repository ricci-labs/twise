import { type IsoDate, todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { ContactHeader } from '@web/components/finance/contact-header'
import { PlanSummaryTiles } from '@web/components/finance/plan-summary-tiles'
import { PageFrame } from '@web/components/layout/page-frame'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import {
  contactBalancesQueryOptions,
  contactOpenItemsQueryOptions,
  contactQueryOptions,
} from '@web/features/contacts/api/contacts.queries'
import { ContactCharges } from '@web/features/contacts/components/contact-charges'
import { ContactDetailDesktop } from '@web/features/contacts/components/contact-detail-desktop'
import { ContactDetailMenu } from '@web/features/contacts/components/contact-detail-menu'
import {
  ContactOpenSection,
  ContactTalkTo,
} from '@web/features/contacts/components/contact-detail-sections'
import {
  contactTilesOf,
  hasSomethingToCharge,
  openItemsByDue,
} from '@web/features/contacts/components/contact-detail-view'
import { NewCharge } from '@web/features/contacts/components/new-charge'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  ContactDetailActionsProps,
  ContactDetailBodyProps,
  ContactDetailFrameProps,
  ContactDetailPageProps,
} from '@web/features/contacts/contacts.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'
import { Send } from 'lucide-react'

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

function ContactDetailBody(props: ContactDetailBodyProps) {
  const { workspaceId, permissions, contact, balance, openItems, today, onNewCharge } = props
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const owedCents = balance?.owedCents ?? 0
  const items = openItemsByDue(openItems, today)
  const canCharge =
    hasPermission(permissions, 'contacts', 'create') && hasSomethingToCharge(balance)
  const canRecordReceipt = hasPermission(permissions, 'entries', 'create') && owedCents > 0
  const menu = (
    <ContactDetailMenu
      workspaceId={workspaceId}
      contact={contact}
      owedCents={owedCents}
      permissions={permissions}
      onNewCharge={onNewCharge}
      onDeleted={props.onDeleted}
    />
  )
  const main = (
    <>
      <ContactHeader
        name={contact.name}
        owedCents={owedCents}
        hasUpcoming={items.upcoming.length > 0}
        isOptedOut={contact.isOptedOut}
      />
      {balance && owedCents > 0 && (
        <PlanSummaryTiles label={messages.tilesLabel} tiles={contactTilesOf(balance)} />
      )}
      {!isDesktop && (
        <ContactDetailActions
          contactId={contact.id}
          canCharge={canCharge}
          canRecordReceipt={canRecordReceipt}
          onNewCharge={onNewCharge}
        />
      )}
      <ContactOpenSection owedCents={owedCents} items={items} />
      <ContactCharges
        workspaceId={workspaceId}
        contactId={contact.id}
        canUpdate={hasPermission(permissions, 'contacts', 'update')}
        today={today}
        contactName={contact.name}
        onResend={props.onChargeOpen}
      />
    </>
  )
  return (
    <>
      {isDesktop ? (
        <ContactDetailDesktop
          workspaceId={workspaceId}
          contact={contact}
          menu={menu}
          canCharge={canCharge}
          canRecordReceipt={canRecordReceipt}
          onNewCharge={onNewCharge}
          main={main}
          talkTo={<ContactTalkTo contact={contact} />}
        />
      ) : (
        <ContactDetailFrame workspaceId={workspaceId} actions={menu}>
          {main}
          <ContactTalkTo contact={contact} />
        </ContactDetailFrame>
      )}
      <ContactChargeEditor {...props} />
    </>
  )
}

function ContactChargeEditor({
  workspaceId,
  permissions,
  contact,
  balance,
  openItems,
  today,
  charge,
  currentUser,
  onChargeClose,
}: ContactDetailBodyProps) {
  if (
    !charge ||
    !hasPermission(permissions, 'contacts', charge === NEW_CHARGE ? 'create' : 'update')
  ) {
    return null
  }
  return (
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

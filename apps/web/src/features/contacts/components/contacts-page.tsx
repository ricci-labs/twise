import { useQuery } from '@tanstack/react-query'
import { Button } from '@web/components/actions/button'
import { ArchivedToggle } from '@web/components/display/archived-toggle'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { KpiSkeleton } from '@web/components/feedback/kpi-skeleton'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import {
  contactBalancesQueryOptions,
  contactsQueryOptions,
} from '@web/features/contacts/api/contacts.queries'
import { newContactLink } from '@web/features/contacts/components/contact-links'
import { ContactList } from '@web/features/contacts/components/contact-list'
import { ContactsSummaryTiles } from '@web/features/contacts/components/contacts-summary-tiles'
import { listedContactsOf, sortContacts } from '@web/features/contacts/components/listed-contacts'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import { CONTACT_SORTS } from '@web/features/contacts/contacts.schemas'
import type {
  ContactsBodyProps,
  ContactsLoadedProps,
  ContactsPageProps,
} from '@web/features/contacts/contacts.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'
import { Plus } from 'lucide-react'

const messages = contactsMessages

const LOADING_ROWS = 4

const SORT_OPTIONS = CONTACT_SORTS.map((sort) => ({ value: sort, label: messages.sort[sort] }))

export function ContactsPage({
  workspaceId,
  permissions,
  sort,
  onSortChange,
  onCharge,
}: ContactsPageProps) {
  usePageTitle(messages.pageTitle)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const canCreate = hasPermission(permissions, 'contacts', 'create')
  return (
    <PageFrame className="gap-4 lg:gap-5">
      <div className="flex flex-col gap-1">
        <PageHeader
          title={messages.title}
          description={messages.description}
          actions={
            canCreate && (
              <Button
                variant={isDesktop ? 'primary' : 'secondary'}
                size={isDesktop ? 'md' : 'sm'}
                render={newContactLink()}
              >
                <Plus aria-hidden="true" />
                {messages.newContact}
              </Button>
            )
          }
        />
        <p className="text-body-sm text-ink-muted lg:hidden">{messages.description}</p>
      </div>
      <ContactsBody
        workspaceId={workspaceId}
        canCreate={canCreate}
        sort={sort}
        onSortChange={onSortChange}
        onCharge={onCharge}
      />
    </PageFrame>
  )
}

function ContactsBody({ workspaceId, canCreate, sort, onSortChange, onCharge }: ContactsBodyProps) {
  const contacts = useQuery(contactsQueryOptions(workspaceId))
  const balances = useQuery(contactBalancesQueryOptions(workspaceId))
  const failed = [contacts, balances].find((query) => query.isError)
  if (failed) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={failed.error instanceof ApiError ? failed.error.ref : null}
        isRetrying={contacts.isFetching || balances.isFetching}
        onRetry={() => {
          for (const query of [contacts, balances]) {
            if (query.isError) {
              void query.refetch()
            }
          }
        }}
      />
    )
  }
  if (!contacts.data || !balances.data) {
    return <ContactsLoading />
  }
  return (
    <ContactsLoaded
      workspaceId={workspaceId}
      contacts={listedContactsOf(contacts.data, balances.data)}
      canCreate={canCreate}
      sort={sort}
      onSortChange={onSortChange}
      onCharge={onCharge}
    />
  )
}

function ContactsLoaded({
  workspaceId,
  contacts,
  canCreate,
  sort,
  onSortChange,
  onCharge,
}: ContactsLoadedProps) {
  const active = contacts.filter((contact) => !contact.isArchived)
  const archived = sortContacts(
    contacts.filter((contact) => contact.isArchived),
    'name',
  )
  const archivedGroup = (
    <ArchivedToggle count={archived.length} gender="masculine">
      <ContactList workspaceId={workspaceId} label={messages.archivedList} contacts={archived} />
    </ArchivedToggle>
  )
  if (active.length === 0) {
    return (
      <>
        <EmptyBlock
          icon="together"
          title={messages.empty.title}
          text={messages.empty.text}
          action={
            canCreate && (
              <Button render={newContactLink()}>
                <Plus aria-hidden="true" />
                {messages.newContact}
              </Button>
            )
          }
        />
        {archivedGroup}
      </>
    )
  }
  return (
    <>
      <ContactsSummaryTiles contacts={active} />
      <ChoiceChips
        label={messages.sort.label}
        variant="pillOutline"
        size="compact"
        options={SORT_OPTIONS}
        value={sort}
        onSelect={(next) => {
          const chosen = CONTACT_SORTS.find((option) => option === next)
          if (chosen) {
            onSortChange(chosen)
          }
        }}
      />
      <ContactList
        workspaceId={workspaceId}
        label={messages.list}
        contacts={sortContacts(active, sort)}
        onCharge={canCreate ? onCharge : undefined}
      />
      {archivedGroup}
    </>
  )
}

function ContactsLoading() {
  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        <div className="flex min-w-min grow basis-pair">
          <KpiSkeleton />
        </div>
        <div className="flex min-w-min grow basis-pair">
          <KpiSkeleton />
        </div>
      </div>
      <ListSkeleton rows={LOADING_ROWS} art="circle" />
    </>
  )
}

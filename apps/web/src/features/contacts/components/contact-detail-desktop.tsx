import { formatBrl, type IsoDate, todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { Card } from '@web/components/display/card'
import { DateBlock } from '@web/components/display/date-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { Breadcrumb } from '@web/components/navigation/breadcrumb'
import {
  contactChargesQueryOptions,
  contactReceiptsQueryOptions,
  moneyAccountsQueryOptions,
} from '@web/features/contacts/api/contacts.queries'
import { contactsMessages } from '@web/features/contacts/contacts.messages'
import type {
  Contact,
  ContactDetailDesktopProps,
  ContactPaymentsCardProps,
  ContactPaymentsListProps,
  ContactReceiptCardProps,
  ReceiptFacts,
} from '@web/features/contacts/contacts.types'
import { ApiError } from '@web/lib/api/api-error'
import { formatShortDate } from '@web/lib/format/calendar'
import { HandCoins, Send } from 'lucide-react'

const messages = contactsMessages.detail
const LOADING_ROWS = 2
const TIME_ZONE = 'America/Sao_Paulo'

export function ContactDetailDesktop({
  workspaceId,
  contact,
  menu,
  canCharge,
  canRecordReceipt,
  onNewCharge,
  main,
  talkTo,
}: ContactDetailDesktopProps) {
  return (
    <PageFrame>
      <div className="mb-2">
        <Breadcrumb
          label={messages.crumb}
          items={[
            {
              label: messages.contacts,
              link: <Link to="/w/$workspaceId/contacts" params={{ workspaceId }} />,
            },
            { label: contact.name },
          ]}
        />
      </div>
      <PageHeader
        title={contact.name}
        description={channelsLineOf(contact)}
        actions={
          <div className="flex items-center gap-2">
            {menu}
            {canCharge && (
              <Button onClick={onNewCharge}>
                <Send aria-hidden="true" />
                {messages.newCharge}
              </Button>
            )}
          </div>
        }
      />
      <div className="mt-5 grid grid-cols-5 items-start gap-6">
        <div className="col-span-3 flex min-w-0 flex-col gap-5">{main}</div>
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          {talkTo}
          {canRecordReceipt && <ContactReceiptCard contact={contact} />}
          <ContactPaymentsCard workspaceId={workspaceId} contactId={contact.id} />
        </div>
      </div>
    </PageFrame>
  )
}

function ContactReceiptCard({ contact }: ContactReceiptCardProps) {
  return (
    <Card title={messages.receiptTitle} description={messages.receiptText(contact.name)}>
      <Button
        variant="secondary"
        size="sm"
        className="self-start"
        render={
          <Link
            to="."
            search={(previous) => ({
              ...previous,
              entry: 'new' as const,
              entryType: 'settlement' as const,
              entryContact: contact.id,
            })}
          />
        }
      >
        <HandCoins aria-hidden="true" />
        {messages.receiptButton}
      </Button>
    </Card>
  )
}

function ContactPaymentsCard({ workspaceId, contactId }: ContactPaymentsCardProps) {
  const receipts = useQuery(contactReceiptsQueryOptions(workspaceId, contactId))
  const charges = useQuery(contactChargesQueryOptions(workspaceId, contactId)).data ?? []
  const accounts = useQuery(moneyAccountsQueryOptions(workspaceId)).data ?? []
  if (receipts.isError) {
    return (
      <Card title={messages.payments}>
        <SectionError
          message={messages.paymentsFailed}
          errorRef={receipts.error instanceof ApiError ? receipts.error.ref : null}
          isRetrying={receipts.isFetching}
          onRetry={() => void receipts.refetch()}
        />
      </Card>
    )
  }
  const facts: ReceiptFacts = {
    chargedOn: new Map(
      charges.flatMap((charge) =>
        charge.payments.map(
          (payment) =>
            [payment.entryId, todayIn(TIME_ZONE, new Date(charge.createdAt)) as IsoDate] as const,
        ),
      ),
    ),
    accountNames: new Map(accounts.map((account) => [account.id, account.name])),
  }
  return (
    <Card title={messages.payments}>
      {receipts.data ? (
        <ContactPaymentsList receipts={receipts.data} facts={facts} />
      ) : (
        <ListSkeleton rows={LOADING_ROWS} />
      )}
    </Card>
  )
}

function ContactPaymentsList({ receipts, facts }: ContactPaymentsListProps) {
  if (receipts.length === 0) {
    return <p className="text-body-sm text-ink-muted">{messages.paymentsEmpty}</p>
  }
  return (
    <ul aria-label={messages.payments} className="flex flex-col">
      {receipts.map((receipt) => {
        const account =
          receipt.postings
            .map((posting) => facts.accountNames.get(posting.accountId))
            .find(Boolean) ?? ''
        const chargedOn = facts.chargedOn.get(receipt.id)
        return (
          <li
            key={receipt.id}
            className="flex items-center gap-3 border-border py-3 not-first:border-t"
          >
            <DateBlock date={receipt.occurredOn as IsoDate} digits="padded" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-semibold text-body-sm text-ink">
                {chargedOn ? messages.chargePayment : messages.contactReceipt}
              </span>
              <span className="line-clamp-2 text-note text-ink-muted">
                {chargedOn
                  ? messages.chargePaymentDetail(formatShortDate(chargedOn), account)
                  : messages.receiptDetail(account)}
              </span>
            </span>
            <span className="font-emphasis whitespace-nowrap text-mint-ink">
              {messages.received(formatBrl(receipt.amountCents))}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function channelsLineOf(contact: Contact): string {
  const lines = messages.channelsLine
  if (contact.phoneE164 && contact.email) {
    return lines.both
  }
  if (contact.phoneE164) {
    return lines.whatsapp
  }
  return contact.email ? lines.email : lines.none
}

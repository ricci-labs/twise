import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import {
  AccountEditor,
  accountSearchSchema,
  CardEditor,
  CategoryEditor,
  cardSearchSchema,
  categorySearchSchema,
} from '@web/features/accounts'
import { AccountActions, AccountMenu } from '@web/features/auth'
import { NewEntry, newEntrySearchSchema } from '@web/features/entries'
import { openWorkspace, WorkspaceShell } from '@web/features/workspaces'

export const Route = createFileRoute('/_app/w/$workspaceId')({
  validateSearch: newEntrySearchSchema
    .extend(accountSearchSchema.shape)
    .extend(categorySearchSchema.shape)
    .extend(cardSearchSchema.shape),
  beforeLoad: ({ context, params }) => openWorkspace(context.queryClient, params.workspaceId),
  component: function WorkspaceRoute() {
    const { workspaceId } = Route.useParams()
    const {
      entry,
      entryType,
      entryAccount,
      entryToAccount,
      entryAmount,
      entrySplitPart,
      entrySplitLabel,
      entryCard,
      entryInvoice,
      entryContact,
      entryRepeat,
      entryOccurrence,
      account: accountParam,
      accountFor,
      category,
      parent,
      kind,
      card,
    } = Route.useSearch()
    const { account, access } = Route.useRouteContext()
    const navigate = useNavigate()
    const accountLink = (
      <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'account' }} />
    )
    const closeAccountForm = () =>
      navigate({
        to: '.',
        search: (previous) => ({ ...previous, account: undefined, accountFor: undefined }),
      })
    const closeCardForm = () =>
      navigate({
        to: '.',
        search: (previous) => ({ ...previous, card: undefined }),
      })
    return (
      <WorkspaceShell
        workspaceId={workspaceId}
        accountMenu={<AccountMenu accountLink={accountLink} />}
        accountActions={<AccountActions accountLink={accountLink} />}
      >
        <Outlet />
        <NewEntry
          workspaceId={workspaceId}
          currentUserId={account.userId}
          currentUserName={account.displayName}
          permissions={access.permissions}
          isOpen={entry === 'new'}
          repeatEntryId={entryRepeat}
          occurrenceId={entryOccurrence}
          prefill={{
            entryType,
            accountId: entryAccount,
            toAccountId: entryToAccount,
            amountCents: entryAmount,
            splitPart:
              entrySplitPart && entrySplitLabel
                ? { position: entrySplitPart, label: entrySplitLabel }
                : undefined,
            cardAccountId: entryCard,
            invoiceId: entryInvoice,
            contactId: entryContact,
          }}
          onSplitPartSaved={(position, entryId) =>
            navigate({
              to: '.',
              search: (previous) => ({ ...previous, splitDone: position, splitEntry: entryId }),
            })
          }
          onClose={() =>
            navigate({
              to: '.',
              search: (previous) => ({
                ...previous,
                entry: undefined,
                entryType: undefined,
                entryAccount: undefined,
                entryToAccount: undefined,
                entryAmount: undefined,
                entrySplitPart: undefined,
                entrySplitLabel: undefined,
                entryCard: undefined,
                entryInvoice: undefined,
                entryContact: undefined,
                entryRepeat: undefined,
                entryOccurrence: undefined,
              }),
            })
          }
        />
        <AccountEditor
          workspaceId={workspaceId}
          currentUserId={account.userId}
          permissions={access.permissions}
          param={accountParam}
          onClose={closeAccountForm}
          onCreated={(accountId) => {
            if (entry === 'new') {
              closeAccountForm()
              return
            }
            if (accountFor) {
              navigate({
                to: '.',
                search: (previous) => ({
                  ...previous,
                  account: undefined,
                  accountFor: undefined,
                  createdAccount: accountId,
                }),
              })
              return
            }
            navigate({
              to: '/w/$workspaceId/accounts',
              params: { workspaceId },
              search: { created: accountId },
            })
          }}
        />
        <CardEditor
          workspaceId={workspaceId}
          currentUserId={account.userId}
          permissions={access.permissions}
          param={card}
          onClose={closeCardForm}
          onCreated={() => {
            if (entry === 'new') {
              closeCardForm()
              return
            }
            navigate({ to: '/w/$workspaceId/cards', params: { workspaceId } })
          }}
        />
        <CategoryEditor
          workspaceId={workspaceId}
          permissions={access.permissions}
          param={category}
          parentParam={parent}
          kindParam={kind}
          onClose={() =>
            navigate({
              to: '.',
              search: (previous) => ({ ...previous, category: undefined, parent: undefined }),
            })
          }
          onCreated={(accountId, createdKind) =>
            navigate({
              to: '/w/$workspaceId/categories',
              params: { workspaceId },
              search: { kind: createdKind, created: accountId },
            })
          }
        />
      </WorkspaceShell>
    )
  },
})

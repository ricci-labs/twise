import { EMAIL_MAX_LENGTH, type InvitationRequest, todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { RichText } from '@web/components/display/rich-text'
import { Alert } from '@web/components/feedback/alert'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { FieldGroup } from '@web/components/forms/field-group'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { PhoneInput } from '@web/components/inputs/phone-input'
import { PickerField } from '@web/components/inputs/picker-field'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import { TextInput } from '@web/components/inputs/text-input'
import { FormOverlay } from '@web/components/layout/form-overlay'
import { PageFrame } from '@web/components/layout/page-frame'
import { SettingsFormPage } from '@web/components/layout/settings-form-page'
import { Sheet } from '@web/components/layout/sheet'
import { membersQueryOptions, rolesQueryOptions } from '@web/features/members/api/members.queries'
import { useInvite } from '@web/features/members/api/use-invite'
import { MembersPage } from '@web/features/members/components/members-page'
import { canGive, roleSentence } from '@web/features/members/components/role-views'
import { membersMessages } from '@web/features/members/members.messages'
import { inviteFormSchema } from '@web/features/members/members.schemas'
import type {
  CreatedInvite,
  InvitedLink,
  InvitedSheetProps,
  InviteFieldsProps,
  InviteFormInput,
  InviteFormProps,
  InvitePageProps,
  Role,
} from '@web/features/members/members.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { copyText } from '@web/lib/clipboard'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatShortDate } from '@web/lib/format/calendar'
import { BRAZIL_CALLING_CODE, formatPhone, phoneE164Of, whatsappLink } from '@web/lib/format/phone'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { Copy, Link2, MessageCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { FormProvider, useController, useWatch } from 'react-hook-form'

const messages = membersMessages.invite
const SKELETON_LINES = 6
const OWNER = 'owner'
const MEMBER = 'member'
const PENDING = 'INVITATION_PENDING'
const TIME_ZONE = 'America/Sao_Paulo'

export function InvitePage(props: InvitePageProps) {
  usePageTitle(messages.pageTitle)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const roles = useQuery(rolesQueryOptions(props.workspaceId))
  const members = useQuery(membersQueryOptions(props.workspaceId))
  if (!roles.data || !members.data) {
    const failed = roles.isError ? roles : members
    return (
      <PageFrame>
        {failed.isError ? (
          <SectionError
            message={errorMessageFor(failed.error)}
            errorRef={failed.error instanceof ApiError ? failed.error.ref : null}
            isRetrying={failed.isFetching}
            onRetry={() => void failed.refetch()}
          />
        ) : (
          <SectionSkeleton lines={SKELETON_LINES} />
        )}
      </PageFrame>
    )
  }
  const isActorOwner = members.data.some(
    (member) => member.membershipId === props.membershipId && member.role.systemKey === OWNER,
  )
  if (isDesktop) {
    return (
      <>
        <MembersPage {...props} tab="members" />
        <InviteForm {...props} roles={roles.data} isActorOwner={isActorOwner} isDialog />
      </>
    )
  }
  return (
    <PageFrame edge="bleed">
      <InviteForm {...props} roles={roles.data} isActorOwner={isActorOwner} isDialog={false} />
    </PageFrame>
  )
}

function InviteForm({
  workspaceId,
  workspaceName,
  permissions,
  isDialog,
  roles,
  isActorOwner,
}: InviteFormProps) {
  const navigate = useNavigate()
  const invite = useInvite(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const [invited, setInvited] = useState<InvitedLink | null>(null)
  const givable = roles.filter((role) => canGive(role, permissions, isActorOwner))
  const form = useSchemaForm({
    schema: inviteFormSchema,
    requiredMessages: messages.required,
    defaultValues: {
      channel: 'email',
      email: '',
      callingCode: BRAZIL_CALLING_CODE,
      phone: '',
      roleId: (givable.find((role) => role.systemKey === MEMBER) ?? givable[0])?.roleId ?? '',
    },
  })
  const toInvitations = () =>
    navigate({ to: '/w/$workspaceId/members/invitations', params: { workspaceId } })

  async function submit(input: InviteFormInput) {
    setProblem(null)
    try {
      const created = await invite.mutateAsync(requestOf(input))
      const link = invitedLinkOf(input, created, roles)
      if (link) {
        setInvited(link)
        return
      }
      showToast(messages.emailSent(input.email.trim()), { tone: 'success' })
      await toInvitations()
    } catch (error) {
      if (error instanceof ApiError && error.code === PENDING) {
        form.setError(
          contactFieldOf(input),
          { type: 'server', message: errorMessageFor(error) },
          { shouldFocus: true },
        )
        return
      }
      setProblem(errorMessageFor(error))
    }
  }

  const body = (
    <>
      {problem && (
        <Alert tone="danger" isUrgent>
          {problem}
        </Alert>
      )}
      <InviteFields roles={roles} givable={givable.map((role) => role.roleId)} />
      <p className="text-body-sm text-ink-muted">{messages.validity}</p>
    </>
  )
  const invitedSheet = (
    <InvitedSheet
      workspaceName={workspaceName}
      invited={invited}
      onClose={() => {
        setInvited(null)
        void toInvitations()
      }}
    />
  )
  if (isDialog) {
    return (
      <FormProvider {...form}>
        <FormOverlay
          title={messages.dialogTitle(workspaceName)}
          closeLabel={messages.close}
          size="md"
          actions="single"
          isOpen
          onRequestClose={() =>
            void navigate({ to: '/w/$workspaceId/members', params: { workspaceId } })
          }
          onSubmit={form.handleSubmit(submit)}
          footer={
            <div className="flex flex-row-reverse items-center justify-between">
              <SubmitButton loadingLabel={messages.sending}>{messages.send}</SubmitButton>
              <Button
                variant="quiet"
                onClick={() =>
                  void navigate({ to: '/w/$workspaceId/members', params: { workspaceId } })
                }
              >
                {messages.cancel}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 px-8 pt-2.5">{body}</div>
        </FormOverlay>
        {invitedSheet}
      </FormProvider>
    )
  }
  return (
    <Form form={form} onSubmit={submit}>
      <SettingsFormPage
        back={<Link to="/w/$workspaceId/members/invitations" params={{ workspaceId }} />}
        backLabel={messages.back}
        title={messages.title}
        footer={
          <SubmitButton loadingLabel={messages.sending} width="full">
            {messages.send}
          </SubmitButton>
        }
      >
        {body}
      </SettingsFormPage>
      {invitedSheet}
    </Form>
  )
}

function InviteFields({ roles, givable }: InviteFieldsProps) {
  const channel = useWatch<InviteFormInput, 'channel'>({ name: 'channel' })
  const { field: channelField } = useController<InviteFormInput, 'channel'>({ name: 'channel' })
  const { field: country } = useController<InviteFormInput, 'callingCode'>({ name: 'callingCode' })
  return (
    <>
      <FieldGroup label={messages.channel} isRequired>
        <SegmentedControl
          label={messages.channel}
          width="full"
          selection="outline"
          value={channel}
          options={[
            { value: 'email', label: messages.channels.email },
            { value: 'phone', label: messages.channels.phone },
          ]}
          onValueChange={(next) => channelField.onChange(next === 'phone' ? 'phone' : 'email')}
        />
      </FieldGroup>
      {channel === 'email' ? (
        <FormField<InviteFormInput>
          name="email"
          label={messages.email}
          help={messages.emailHelp}
          isRequired
          maxLength={EMAIL_MAX_LENGTH}
        >
          {(control) => <TextInput type="email" autoComplete="off" {...control} />}
        </FormField>
      ) : (
        <FormField<InviteFormInput>
          name="phone"
          label={messages.phone}
          help={messages.phoneHelp}
          isRequired
        >
          {(control) => (
            <PhoneInput
              {...control}
              callingCode={country.value}
              onCallingCodeChange={country.onChange}
            />
          )}
        </FormField>
      )}
      <RoleField roles={roles} givable={givable} />
    </>
  )
}

function RoleField({ roles, givable }: InviteFieldsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  return (
    <FormField<InviteFormInput> name="roleId" label={messages.role} isRequired>
      {(control) => {
        const chosen = roles.find((role) => role.roleId === control.value)
        return (
          <>
            <PickerField
              id={control.id}
              ref={(element) => {
                anchor.current = element
                control.ref(element)
              }}
              aria-describedby={control['aria-describedby']}
              value={chosen?.name ?? null}
              detail={chosen ? roleSentence(chosen) : undefined}
              placeholder={messages.role}
              onClick={() => setIsOpen(true)}
            />
            <PickerSheet
              title={messages.role}
              items={roles.map((role) => ({
                value: role.roleId,
                label: role.name,
                detail: roleSentence(role),
                isDisabled: !givable.includes(role.roleId),
              }))}
              value={control.value || null}
              anchor={anchor}
              isOpen={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open)
                if (!open) {
                  control.onBlur()
                }
              }}
              onSelect={(roleId) => control.onChange({ target: { value: roleId } })}
            />
          </>
        )
      }}
    </FormField>
  )
}

function InvitedSheet({ workspaceName, invited, onClose }: InvitedSheetProps) {
  async function copy(link: string) {
    const isCopied = await copyText(link)
    showToast(isCopied ? messages.copied : messages.copyFailed, {
      tone: isCopied ? 'success' : 'danger',
    })
  }
  return (
    <Sheet
      title={messages.ready}
      closeLabel={messages.close}
      isOpen={invited !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      {invited && (
        <div className="flex flex-col gap-3">
          <Alert tone="success">
            {messages.created(
              invited.contact,
              invited.roleName,
              formatShortDate(todayIn(TIME_ZONE, new Date(invited.expiresAt))),
            )}
          </Alert>
          <Alert tone="warning">
            <RichText text={messages.warning} />
          </Alert>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface px-3.5 py-3">
            <span className="flex items-center gap-1.5 text-label font-semibold text-ink">
              <Link2 aria-hidden="true" className="size-4" />
              {messages.link}
            </span>
            <span className="font-mono text-note break-all text-ink-muted">{invited.link}</span>
          </div>
          <Button
            width="full"
            render={
              <a
                href={whatsappLink(
                  invited.phoneE164,
                  messages.whatsappText(workspaceName, invited.link),
                )}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <MessageCircle aria-hidden="true" />
            {messages.whatsapp}
          </Button>
          <Button variant="secondary" width="full" onClick={() => void copy(invited.link)}>
            <Copy aria-hidden="true" />
            {messages.copy}
          </Button>
        </div>
      )}
    </Sheet>
  )
}

function requestOf(input: InviteFormInput): InvitationRequest {
  if (input.channel === 'email') {
    return { email: input.email.trim(), roleId: input.roleId }
  }
  return { phoneE164: phoneOf(input) ?? '', roleId: input.roleId }
}

function invitedLinkOf(
  input: InviteFormInput,
  created: CreatedInvite,
  roles: readonly Role[],
): InvitedLink | null {
  const phoneE164 = phoneOf(input)
  if (!created.shareableLink || !phoneE164) {
    return null
  }
  return {
    contact: formatPhone(phoneE164),
    roleName: roles.find((role) => role.roleId === input.roleId)?.name ?? '',
    expiresAt: created.expiresAt,
    link: created.shareableLink,
    phoneE164,
  }
}

function contactFieldOf(input: InviteFormInput): 'email' | 'phone' {
  return input.channel === 'email' ? 'email' : 'phone'
}

function phoneOf(input: InviteFormInput): string | null {
  return phoneE164Of({ callingCode: input.callingCode, number: input.phone })
}

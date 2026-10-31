import {
  APP_MODULES,
  MODULE_ACTIONS,
  type NewRole,
  ROLE_DESCRIPTION_MAX_LENGTH,
  ROLE_NAME_MAX_LENGTH,
} from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { Alert } from '@web/components/feedback/alert'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { FieldGroup } from '@web/components/forms/field-group'
import { Form } from '@web/components/forms/form'
import { FormField } from '@web/components/forms/form-field'
import { SubmitButton } from '@web/components/forms/submit-button'
import { PermissionRows } from '@web/components/inputs/permission-rows'
import { TextArea } from '@web/components/inputs/text-area'
import { TextInput } from '@web/components/inputs/text-input'
import { PageFrame } from '@web/components/layout/page-frame'
import { SettingsFormPage } from '@web/components/layout/settings-form-page'
import { rolesQueryOptions } from '@web/features/members/api/members.queries'
import { useSaveRole } from '@web/features/members/api/use-save-role'
import { RoleDelete } from '@web/features/members/components/role-delete'
import { RoleEditorDesktop } from '@web/features/members/components/role-editor-desktop'
import { membersMessages } from '@web/features/members/members.messages'
import { roleFormSchema } from '@web/features/members/members.schemas'
import type {
  PermissionsFieldProps,
  PresetButtonsProps,
  Role,
  RoleEditorFormProps,
  RoleEditorPageProps,
  RoleEditorUnavailableProps,
  RoleFormInput,
  RoleIdentityFieldsProps,
  RolePreset,
} from '@web/features/members/members.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useSchemaForm } from '@web/lib/forms/use-schema-form'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

const messages = membersMessages.editor
const OWNER = 'owner'
const NAME_TAKEN = 'ROLE_NAME_TAKEN'
const SKELETON_LINES = 10
const PRESETS: readonly RolePreset[] = ['admin', 'member', 'viewer']
const AREAS = APP_MODULES.map((module) => ({ module, label: membersMessages.areas[module] }))

export function RoleEditorPage({ workspaceId, roleId, permissions }: RoleEditorPageProps) {
  const roles = useQuery(rolesQueryOptions(workspaceId))
  const role = roleOf(roles.data, roleId)
  usePageTitle(role?.name ?? messages.newTitle)
  if (!roles.data || (roleId !== null && !role)) {
    return <RoleEditorUnavailable roles={roles} />
  }
  return (
    <PageFrame edge="bleed">
      <RoleEditorForm
        key={role?.roleId ?? 'new'}
        workspaceId={workspaceId}
        role={role}
        roles={roles.data}
        actorPermissions={permissions}
      />
    </PageFrame>
  )
}

function RoleEditorForm({ workspaceId, role, roles, actorPermissions }: RoleEditorFormProps) {
  const navigate = useNavigate()
  const save = useSaveRole(workspaceId)
  const [problem, setProblem] = useState<string | null>(null)
  const isLocked = role?.systemKey === OWNER
  const canDelete = hasPermission(actorPermissions, 'members', 'delete')
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const form = useSchemaForm({
    schema: roleFormSchema,
    requiredMessages: messages.required,
    defaultValues: roleFormValuesOf(role),
  })

  async function submit(input: RoleFormInput) {
    setProblem(null)
    try {
      const request = roleRequestOf(input)
      await save.mutateAsync({ roleId: role?.roleId ?? null, role: request })
      showToast(savedMessageOf(role, request.name), { tone: 'success' })
      await navigate({ to: '/w/$workspaceId/members/roles', params: { workspaceId } })
    } catch (error) {
      if (error instanceof ApiError && error.code === NAME_TAKEN) {
        form.setError(
          'name',
          { type: 'server', message: errorMessageFor(error) },
          { shouldFocus: true },
        )
        return
      }
      setProblem(errorMessageFor(error))
    }
  }

  function copyPreset(preset: RolePreset) {
    const source = roles.find((candidate) => candidate.systemKey === preset)
    const copied = (source?.permissions ?? []).filter((permission) =>
      hasPermission(actorPermissions, permission.module, permission.action),
    )
    form.setValue('permissions', copied, { shouldDirty: true, shouldValidate: true })
  }

  const saveLabel = role ? messages.save : messages.create
  const identity = <RoleIdentityFields roles={roles} isLocked={isLocked} onCopy={copyPreset} />
  const remove = role?.systemKey === null && canDelete && (
    <RoleDelete workspaceId={workspaceId} role={role} isMenu={isDesktop} />
  )
  if (isDesktop) {
    return (
      <Form form={form} onSubmit={submit}>
        <RoleEditorDesktop
          workspaceId={workspaceId}
          role={role}
          problem={problem}
          identity={identity}
          permissions={
            <PermissionsField
              actorPermissions={actorPermissions}
              isLocked={isLocked}
              layout="matrix"
            />
          }
          remove={remove}
          save={
            !isLocked && (
              <SubmitButton requiresChange loadingLabel={messages.saving}>
                {saveLabel}
              </SubmitButton>
            )
          }
        />
      </Form>
    )
  }
  return (
    <Form form={form} onSubmit={submit}>
      <SettingsFormPage
        back={<Link to="/w/$workspaceId/members/roles" params={{ workspaceId }} />}
        backLabel={messages.back}
        title={role?.name ?? messages.newTitle}
        readOnlyNote={isLocked ? messages.ownerLocked : undefined}
        footer={
          <SubmitButton requiresChange loadingLabel={messages.saving} width="full">
            {saveLabel}
          </SubmitButton>
        }
      >
        {problem && (
          <Alert tone="danger" isUrgent>
            {problem}
          </Alert>
        )}
        {identity}
        <PermissionsField actorPermissions={actorPermissions} isLocked={isLocked} layout="rows" />
        {remove}
      </SettingsFormPage>
    </Form>
  )
}

function RoleIdentityFields({ roles, isLocked, onCopy }: RoleIdentityFieldsProps) {
  return (
    <>
      <FormField<RoleFormInput>
        name="name"
        label={messages.name}
        isRequired={!isLocked}
        isReadOnly={isLocked}
        maxLength={ROLE_NAME_MAX_LENGTH}
      >
        {(control) => (
          <TextInput autoComplete="off" placeholder={messages.namePlaceholder} {...control} />
        )}
      </FormField>
      <FormField<RoleFormInput>
        name="description"
        label={messages.description}
        isReadOnly={isLocked}
        maxLength={ROLE_DESCRIPTION_MAX_LENGTH}
      >
        {(control) => <TextArea {...control} />}
      </FormField>
      {!isLocked && <PresetButtons roles={roles} onCopy={onCopy} />}
    </>
  )
}

function PresetButtons({ roles, onCopy }: PresetButtonsProps) {
  return (
    <FieldGroup label={messages.presets} note={messages.presetsHelp}>
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => (
          <Button key={preset} variant="subtle" size="sm" onClick={() => onCopy(preset)}>
            {roles.find((candidate) => candidate.systemKey === preset)?.name ??
              messages.presetNames[preset]}
          </Button>
        ))}
      </div>
    </FieldGroup>
  )
}

function PermissionsField({ actorPermissions, isLocked, layout }: PermissionsFieldProps) {
  const { control } = useFormContext<RoleFormInput>()
  const lacksSome = MODULE_ACTIONS.some(
    (permission) => !hasPermission(actorPermissions, permission.module, permission.action),
  )
  const rows = (
    <div className="flex flex-col gap-3">
      {lacksSome && !isLocked && <Alert tone="info">{messages.lockedNote}</Alert>}
      <Controller
        control={control}
        name="permissions"
        render={({ field }) => (
          <PermissionRows
            label={messages.permissions}
            areas={AREAS}
            value={field.value}
            allowed={actorPermissions}
            isDisabled={isLocked}
            layout={layout}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  )
  if (layout === 'matrix') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-note text-ink-muted">{messages.matrixHelp}</p>
        {rows}
      </div>
    )
  }
  return (
    <FieldGroup label={messages.permissions} isRequired={!isLocked} help={messages.permissionsHelp}>
      {rows}
    </FieldGroup>
  )
}

function roleOf(roles: readonly Role[] | undefined, roleId: string | null): Role | null {
  return roleId === null ? null : (roles?.find((item) => item.roleId === roleId) ?? null)
}

function RoleEditorUnavailable({ roles }: RoleEditorUnavailableProps) {
  if (!roles.data && !roles.isError) {
    return (
      <PageFrame>
        <SectionSkeleton lines={SKELETON_LINES} />
      </PageFrame>
    )
  }
  return (
    <PageFrame>
      <SectionError
        message={roles.isError ? errorMessageFor(roles.error) : messages.notFound}
        errorRef={roles.error instanceof ApiError ? roles.error.ref : null}
        isRetrying={roles.isFetching}
        onRetry={() => void roles.refetch()}
      />
    </PageFrame>
  )
}

function roleFormValuesOf(role: Role | null): RoleFormInput {
  return {
    name: role?.name ?? '',
    description: role?.description ?? '',
    permissions: role ? [...role.permissions] : [],
  }
}

function roleRequestOf(input: RoleFormInput): NewRole {
  const description = input.description.trim()
  return {
    name: input.name.trim(),
    description: description === '' ? null : description,
    permissions: input.permissions,
  }
}

function savedMessageOf(role: Role | null, name: string): string {
  return role ? messages.saved(name) : messages.created(name)
}

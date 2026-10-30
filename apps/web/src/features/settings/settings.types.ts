import type { ChargeTextField, IsoDate, Permission } from '@financas/shared'
import type { UseQueryResult } from '@tanstack/react-query'
import type { MiniMonthHoliday } from '@web/components/display/mini-month-calendar'
import type { ChargeEmailPreviewProps } from '@web/components/finance/charge-email-preview'
import type { HolidayStatus } from '@web/components/finance/holiday-row'
import type {
  fetchChargeText,
  fetchHolidays,
  fetchWorkspaceSettings,
} from '@web/features/settings/api/settings.queries'
import type {
  chargeTextFormSchema,
  holidayFormSchemaFor,
  holidaysSearchSchema,
  pixFormSchema,
} from '@web/features/settings/settings.schemas'
import type { ReactNode } from 'react'
import type { z } from 'zod'

export type HolidaysSearch = z.infer<typeof holidaysSearchSchema>

export type HolidayFormInput = z.input<ReturnType<typeof holidayFormSchemaFor>>

export type PixFormInput = z.input<typeof pixFormSchema>

export type ChargeTextFormInput = z.input<typeof chargeTextFormSchema>

export type ChargeTextFormOutput = z.output<typeof chargeTextFormSchema>

export type SavedChargeText = Awaited<ReturnType<typeof fetchChargeText>>

export type WorkspaceSettings = Awaited<ReturnType<typeof fetchWorkspaceSettings>>

export type HolidaysOfYear = Awaited<ReturnType<typeof fetchHolidays>>

export type HolidaySummary = HolidaysOfYear['summary']

export type UpcomingHoliday = NonNullable<HolidaySummary['next']>

export type HolidayMonth = {
  month: string
  holidays: readonly MiniMonthHoliday[]
}

export type HolidayView = {
  key: string
  holidayId: string | null
  onDate: IsoDate
  name: string
  status: HolidayStatus
}

export type HolidayLists = {
  workspace: readonly HolidayView[]
  national: readonly HolidayView[]
}

export type SettingsPageProps = {
  workspaceId: string
  workspaceName: string
  permissions: readonly Permission[]
}

export type NameRowProps = {
  workspaceId: string
  workspaceName: string
}

export type HolidaysRowProps = {
  workspaceId: string
}

export type PixRowProps = {
  workspaceId: string
}

export type PixPageProps = {
  workspaceId: string
  workspaceName: string
  permissions: readonly Permission[]
}

export type PixContentProps = {
  workspaceId: string
  canUpdate: boolean
  lead: string | null
}

export type PixSettingsFormProps = PixContentProps & {
  settings: WorkspaceSettings
}

export type PixBankPreviewProps = {
  receiverName: string
  receiverCity: string
}

export type HolidaysPageProps = {
  workspaceId: string
  permissions: readonly Permission[]
  search: HolidaysSearch
}

export type HolidaysContentProps = {
  workspaceId: string
  permissions: readonly Permission[]
  today: UseQueryResult<IsoDate>
  year: number | null
  isDesktop: boolean
  onAdd: (() => void) | null
}

export type HolidaysOfYearProps = {
  workspaceId: string
  permissions: readonly Permission[]
  year: number
  today: IsoDate
  isDesktop: boolean
  onAdd: (() => void) | null
}

export type HolidaysCalendarProps = {
  workspaceId: string
  permissions: readonly Permission[]
  holidays: HolidaysOfYear
  year: number
  today: IsoDate
}

export type NextHolidaySlotProps = {
  workspaceId: string
  holidays: HolidaysOfYear
  year: number
}

export type WorkspaceHolidaysCardProps = {
  workspaceId: string
  permissions: readonly Permission[]
  holidays: readonly HolidayView[]
}

export type HolidayLegendCardProps = {
  summary: HolidaySummary
  today: IsoDate
}

export type HolidayListsProps = {
  workspaceId: string
  permissions: readonly Permission[]
  lists: HolidayLists
  onAdd: (() => void) | null
}

export type HolidayActionsProps = {
  workspaceId: string
  holiday: HolidayView
}

export type HolidaySheetProps = {
  workspaceId: string
  year: number
  today: IsoDate
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onAdded: (onDate: IsoDate) => void
}

export type ChargeTextRowProps = {
  workspaceId: string
}

export type ChargeTextPageProps = {
  workspaceId: string
  workspaceName: string
  requesterName: string
  requesterEmail: string
  permissions: readonly Permission[]
}

export type ChargeTextContentProps = {
  workspaceId: string
  workspaceName: string
  requesterName: string
  requesterEmail: string
  canUpdate: boolean
  isDesktop: boolean
}

export type ChargeTextFormProps = ChargeTextContentProps & {
  saved: SavedChargeText
  settings: WorkspaceSettings
  today: IsoDate
}

export type ChargeTextLayoutProps = ChargeTextFormProps & {
  fields: ReactNode
  submitButton: ReactNode
}

export type ChargeTextFieldsProps = {
  canUpdate: boolean
  footer: ReactNode
}

export type ChargeTextFieldProps = {
  field: ChargeTextField
  label: string
  help: string
  isRequired: boolean
  isSingleLine: boolean
  canUpdate: boolean
  onFocus: (field: ChargeTextField) => void
  registerElement: (field: ChargeTextField, element: HTMLTextAreaElement | null) => void
}

export type ChargeTextSample = {
  requesterName: string
  requesterEmail: string
  workspaceName: string
  today: IsoDate
  pix: WorkspaceSettings
}

export type ChargeTextPreviews = {
  sender: string
  subject: string
  preheader: string
  whatsApp: string
  pixPayload: string | null
  email: ChargeEmailPreviewProps
}

export type ChargeTextPreviewProps = {
  previews: ChargeTextPreviews
}

export type ChargeTextPreviewTab = 'email' | 'whatsapp'

export type WorkspaceNamePageProps = {
  workspaceId: string
  workspaceName: string
  permissions: readonly Permission[]
}

export type WorkspaceNameFormProps = {
  workspaceId: string
  workspaceName: string
  currency: string
  canUpdate: boolean
}

export type WorkspaceNameInput = { name: string }

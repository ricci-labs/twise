import type { IsoDate, Permission } from '@financas/shared'
import type { HolidayStatus } from '@web/components/finance/holiday-row'
import type { fetchHolidays } from '@web/features/settings/api/settings.queries'
import type {
  holidayFormSchemaFor,
  holidaysSearchSchema,
} from '@web/features/settings/settings.schemas'
import type { z } from 'zod'

export type HolidaysSearch = z.infer<typeof holidaysSearchSchema>

export type HolidayFormInput = z.input<ReturnType<typeof holidayFormSchemaFor>>

export type HolidaysOfYear = Awaited<ReturnType<typeof fetchHolidays>>

export type HolidaySummary = HolidaysOfYear['summary']

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
  permissions: readonly Permission[]
}

export type HolidaysRowProps = {
  workspaceId: string
}

export type HolidaysPageProps = {
  workspaceId: string
  permissions: readonly Permission[]
  search: HolidaysSearch
}

export type HolidaysContentProps = {
  workspaceId: string
  permissions: readonly Permission[]
  search: HolidaysSearch
  onYearChange: (year: number) => void
}

export type HolidaysOfYearProps = {
  workspaceId: string
  permissions: readonly Permission[]
  year: number
  today: IsoDate
  onAdd: (() => void) | null
}

export type HolidaysBodyProps = {
  workspaceId: string
  permissions: readonly Permission[]
  year: number
  today: IsoDate
  onYearChange: (year: number) => void
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

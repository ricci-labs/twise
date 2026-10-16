import {
  HOLIDAY_YEAR_MAX,
  HOLIDAY_YEAR_MIN,
  type IsoDate,
  nationalHolidays,
  newHolidaySchema,
  parseIsoDate,
} from '@financas/shared'
import { settingsMessages } from '@web/features/settings/settings.messages'
import { z } from 'zod'

const sheet = settingsMessages.sheet

export const holidaysSearchSchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(HOLIDAY_YEAR_MIN)
    .max(HOLIDAY_YEAR_MAX)
    .optional()
    .catch(undefined),
})

export function holidayFormSchemaFor(takenDates: ReadonlySet<IsoDate>) {
  return z.strictObject({
    onDate: newHolidaySchema.shape.onDate
      .refine((date) => !isNationalHoliday(date), { message: sheet.nationalDate })
      .refine((date) => !takenDates.has(date), { message: sheet.takenDate }),
    name: newHolidaySchema.shape.name,
  })
}

function isNationalHoliday(date: IsoDate): boolean {
  if (!newHolidaySchema.shape.onDate.safeParse(date).success) {
    return false
  }
  return nationalHolidays(parseIsoDate(date).year).some((holiday) => holiday.on === date)
}

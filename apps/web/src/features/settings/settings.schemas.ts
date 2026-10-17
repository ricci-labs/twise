import {
  CHARGE_TEXT_LIMITS,
  type ChargeTextField,
  HOLIDAY_YEAR_MAX,
  HOLIDAY_YEAR_MIN,
  type IsoDate,
  nationalHolidays,
  newHolidaySchema,
  parseIsoDate,
  pixReceivingSchema,
  unknownChargeTags,
} from '@financas/shared'
import { settingsMessages } from '@web/features/settings/settings.messages'
import { z } from 'zod'

const sheet = settingsMessages.sheet
const chargeText = settingsMessages.chargeText

export const holidaysSearchSchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(HOLIDAY_YEAR_MIN)
    .max(HOLIDAY_YEAR_MAX)
    .optional()
    .catch(undefined),
})

export const pixFormSchema = pixReceivingSchema.unwrap()

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

export const chargeTextFormSchema = z.strictObject({
  subject: chargeTextFieldSchema('subject'),
  opening: chargeTextFieldSchema('opening'),
  closing: chargeTextFieldSchema('closing'),
})

function chargeTextFieldSchema(field: ChargeTextField) {
  const { minLength, maxLength } = CHARGE_TEXT_LIMITS[field]
  return z
    .string()
    .trim()
    .min(minLength)
    .max(maxLength)
    .superRefine((value, context) => {
      const [unknownTag] = unknownChargeTags(value)
      if (unknownTag) {
        context.addIssue({ code: 'custom', message: chargeText.unknownTag(unknownTag) })
      }
    })
}

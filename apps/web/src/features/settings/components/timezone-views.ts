import type { PickerItem } from '@web/components/inputs/picker-sheet'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type { TimezoneText } from '@web/features/settings/settings.types'

const messages = settingsMessages.calendar
const OFFSET_LOCALE = 'en-US'
const GMT = 'GMT'
const PATH_SEPARATOR = '/'
const WORD_SEPARATOR = /_/g

export const OTHER_ZONES = 'others'

export function brazilZoneItems(): PickerItem[] {
  return [
    ...Object.entries(messages.brazil).map(([zone, text]) => ({
      value: zone,
      label: text.label,
      detail: text.detail,
    })),
    { value: OTHER_ZONES, label: messages.others, detail: messages.othersDetail, hasChevron: true },
  ]
}

export function otherZoneItems(now: Date): PickerItem[] {
  return Intl.supportedValuesOf('timeZone')
    .filter((zone) => messages.brazil[zone] === undefined)
    .map((zone) => ({ value: zone, label: cityOf(zone), detail: regionOf(zone, now) }))
    .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'))
}

export function timezoneText(zone: string, now: Date): TimezoneText {
  const brazil = messages.brazil[zone]
  if (brazil) {
    return brazil
  }
  return { label: messages.otherZone(cityOf(zone), offsetOf(zone, now)), detail: zone }
}

function cityOf(zone: string): string {
  return (zone.split(PATH_SEPARATOR).at(-1) ?? zone).replace(WORD_SEPARATOR, ' ')
}

function regionOf(zone: string, now: Date): string {
  const [region] = zone.split(PATH_SEPARATOR)
  return `${region} · ${offsetOf(zone, now)}`
}

function offsetOf(zone: string, now: Date): string {
  const parts = new Intl.DateTimeFormat(OFFSET_LOCALE, {
    timeZone: zone,
    timeZoneName: 'shortOffset',
  }).formatToParts(now)
  return parts.find((part) => part.type === 'timeZoneName')?.value ?? GMT
}

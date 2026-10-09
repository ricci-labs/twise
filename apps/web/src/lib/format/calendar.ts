import { dayOfWeek, type IsoDate, parseIsoDate } from '@financas/shared'
import type { DateBlock } from '@web/lib/format/format.types'

const SHORT_MONTHS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]
const LONG_MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]
const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const TWO_DIGITS = 2
const YEAR_DIGITS = -2

export function formatDayMonth(date: IsoDate): string {
  const { month, day } = parseIsoDate(date)
  return `${day} ${SHORT_MONTHS[month - 1]}`
}

export function formatDayMonthLong(date: IsoDate): string {
  const { month, day } = parseIsoDate(date)
  return `${day} de ${LONG_MONTHS[month - 1]}`
}

export function formatShortDate(date: IsoDate): string {
  const { month, day } = parseIsoDate(date)
  return `${pad(day)}/${pad(month)}`
}

export function formatFullDate(date: IsoDate): string {
  const { year } = parseIsoDate(date)
  return `${formatShortDate(date)}/${year}`
}

export function formatMonthLabel(label: string): string {
  const { year, month } = parseIsoDate(`${label}-01`)
  return `${SHORT_MONTHS[month - 1]}/${String(year).slice(YEAR_DIGITS)}`
}

export function formatMonthName(label: string): string {
  const { month } = parseIsoDate(`${label}-01`)
  return LONG_MONTHS[month - 1] ?? label
}

export function dateBlockOf(date: IsoDate): DateBlock {
  const { month, day } = parseIsoDate(date)
  return { day: String(day), month: SHORT_MONTHS[month - 1] ?? '' }
}

export function formatMonthTitle(label: string): string {
  const name = formatMonthName(label)
  return name.charAt(0).toLocaleUpperCase('pt-BR') + name.slice(1)
}

export function formatRange(start: IsoDate, end: IsoDate): string {
  return `${formatDayMonth(start)} – ${formatDayMonth(end)}`
}

export function formatWeekday(date: IsoDate): string {
  return WEEKDAYS[dayOfWeek(date)] ?? ''
}

function pad(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0')
}

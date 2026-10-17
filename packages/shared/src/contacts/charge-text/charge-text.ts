import {
  CHARGE_TAGS,
  CHARGE_TEXT_FIELDS,
  CHARGE_TEXT_LIMITS,
  type ChargeTag,
  type ChargeTextChannel,
  type ChargeTextField,
  DEFAULT_CHARGE_CLOSINGS,
  DEFAULT_CHARGE_OPENING,
  DEFAULT_CHARGE_OPENING_WITHOUT_PIX,
} from '@shared/contacts/charge-text/charge-text.constants'
import type {
  ChargeTagSource,
  ChargeTagValues,
  ChargeText,
  ChargeTextIssue,
} from '@shared/contacts/charge-text/charge-text.types'
import { toBrazilianDate } from '@shared/core/calendar/dates'
import { formatBrl } from '@shared/core/money/money'

const TAG_PATTERN = /\{[^{}]*\}/g
const ELLIPSIS = '…'

export function chargeTextIssues(text: ChargeText): ChargeTextIssue[] {
  return CHARGE_TEXT_FIELDS.flatMap((field) => {
    const value = text[field]
    const issue = value === null ? undefined : fieldIssue(field, value)
    return issue ? [issue] : []
  })
}

export function unknownChargeTags(template: string): string[] {
  return (template.match(TAG_PATTERN) ?? []).filter((tag) => !isChargeTag(tag))
}

export function fillChargeTags(template: string, source: ChargeTagSource): string {
  const values = chargeTagValues(source)
  return template.replace(TAG_PATTERN, (tag) => (isChargeTag(tag) ? values[tag] : tag))
}

export function chargeSubject(subject: string, source: ChargeTagSource): string {
  const filled = fillChargeTags(subject, source)
  const { maxLength } = CHARGE_TEXT_LIMITS.subject
  return filled.length > maxLength ? `${filled.slice(0, maxLength - 1)}${ELLIPSIS}` : filled
}

export function chargeOpeningFor(opening: string, hasPix: boolean): string {
  return !hasPix && opening === DEFAULT_CHARGE_OPENING
    ? DEFAULT_CHARGE_OPENING_WITHOUT_PIX
    : opening
}

export function chargeClosingFor(closing: string | null, channel: ChargeTextChannel): string {
  return closing ?? DEFAULT_CHARGE_CLOSINGS[channel]
}

function fieldIssue(field: ChargeTextField, value: string): ChargeTextIssue | undefined {
  const { minLength, maxLength } = CHARGE_TEXT_LIMITS[field]
  if (value.length < minLength) {
    return { field, reason: 'empty' }
  }
  const [unknownTag] = unknownChargeTags(value)
  if (unknownTag) {
    return { field, reason: 'unknown_tag', tag: unknownTag }
  }
  if (value.length > maxLength) {
    return { field, reason: 'too_long', maxLength }
  }
  return undefined
}

function isChargeTag(tag: string): tag is ChargeTag {
  return (CHARGE_TAGS as readonly string[]).includes(tag)
}

function chargeTagValues(source: ChargeTagSource): ChargeTagValues {
  return {
    '{contato}': source.contactName,
    '{quem cobra}': source.requesterName,
    '{valor}': formatBrl(source.totalCents),
    '{vencimento}': source.dueOn ? toBrazilianDate(source.dueOn) : '',
    '{espaço}': source.workspaceName,
  }
}

const SNOOZED_AT_KEY = 'installOfferSnoozedAt'
const SNOOZE_DAYS = 30
const DAY_MS = 86_400_000

export function isSnoozed(now: number): boolean {
  const snoozedAt = Number(readSnoozedAt())
  return snoozedAt > 0 && now - snoozedAt < SNOOZE_DAYS * DAY_MS
}

export function snooze(now: number): void {
  try {
    localStorage.setItem(SNOOZED_AT_KEY, String(now))
  } catch {
    return
  }
}

function readSnoozedAt(): string | null {
  try {
    return localStorage.getItem(SNOOZED_AT_KEY)
  } catch {
    return null
  }
}

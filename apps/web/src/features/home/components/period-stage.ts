import { addMonths, parseIsoDate, toYearMonthLabel } from '@financas/shared'
import type { Overview, PeriodStage } from '@web/features/home/home.types'

export function periodStageOf({ today, period }: Overview): PeriodStage {
  if (today > period.end) {
    return 'closed'
  }
  return today < period.start ? 'future' : 'open'
}

export function neighbourPeriod(label: string, step: -1 | 1): string {
  return toYearMonthLabel(addMonths(parseIsoDate(`${label}-01`), step))
}

import { formatBrl } from '@financas/shared'
import { IncomeBar } from '@web/components/charts/income-bar'
import { Card } from '@web/components/display/card'
import { homeMessages } from '@web/features/home/home.messages'
import type { IncomeSplitCardProps } from '@web/features/home/home.types'

const messages = homeMessages.incomeSplit

export function IncomeSplitCard({ overview, className }: IncomeSplitCardProps) {
  const { metrics } = overview
  const share = metrics.incomeShare
  if (!share) {
    return null
  }
  const isCommissionApart =
    metrics.budgetIncome === metrics.fixedIncome && metrics.variableIncome > 0
  return (
    <Card
      className={className}
      layout="centered"
      title={messages.title}
      description={messages.description(formatBrl(metrics.budgetIncome))}
      footerStat={
        isCommissionApart ? messages.commissionApart(formatBrl(metrics.variableIncome)) : undefined
      }
    >
      <IncomeBar
        segments={[
          {
            key: 'spent',
            tone: 'spent',
            label: messages.spent,
            percent: share.spentPercent,
            percentLabel: `${share.spentPercent}%`,
            amountLabel: formatBrl(metrics.spent),
          },
          {
            key: 'committed',
            tone: 'committed',
            label: messages.committed,
            percent: share.committedPercent,
            percentLabel: `${share.committedPercent}%`,
            amountLabel: formatBrl(metrics.committed),
          },
          {
            key: 'free',
            tone: 'free',
            label: messages.free,
            percent: share.freePercent,
            percentLabel: `${share.freePercent}%`,
            amountLabel: formatBrl(Math.max(metrics.freeToSpend, 0)),
          },
        ]}
      />
    </Card>
  )
}

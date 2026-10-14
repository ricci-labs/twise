import { invoiceStatusOn, invoicesForInstallments } from '@shared/ledger/cards/billing-cycle'
import { splitInstallments } from '@shared/ledger/installments/installments'
import type {
  InstallmentPlanInput,
  PlannedInstallment,
} from '@shared/ledger/installments/installments.types'

const CLOSED = 'closed'

export function installmentPlan({
  purchaseDate,
  card,
  totalCents,
  count,
  firstInstallment,
  today,
}: InstallmentPlanInput): PlannedInstallment[] {
  if (firstInstallment < 1 || firstInstallment > count) {
    throw new RangeError(`First installment ${firstInstallment} is outside 1..${count}`)
  }
  const amounts = splitInstallments(totalCents, count)
  const invoices = invoicesForInstallments(purchaseDate, card, count)
  return invoices.slice(firstInstallment - 1).map((invoice, offset) => {
    const index = firstInstallment - 1 + offset
    return {
      installmentNo: index + 1,
      count,
      invoice,
      amountCents: amounts[index] ?? 0,
      isInvoiceClosed: invoiceStatusOn(invoice, today, card) === CLOSED,
    }
  })
}

export function firstOpenInstallment(plan: readonly PlannedInstallment[]): number | undefined {
  return plan.find((installment) => !installment.isInvoiceClosed)?.installmentNo
}

import { ArchivedToggle } from '@web/components/display/archived-toggle/archived-toggle'
import { AccountRow } from '@web/components/finance/account-row'
import type { ComponentExamples } from '@web/lib/examples.types'

export const archivedToggleExamples: ComponentExamples = {
  component: 'ArchivedToggle',
  examples: [
    {
      name: 'Arquivadas, no fim da lista',
      render: () => (
        <ArchivedToggle count={1}>
          <ul className="flex flex-col rounded-lg border border-border bg-surface px-3 py-1">
            <AccountRow
              name="Conta antiga"
              icon="wallet"
              color={null}
              detail="Conta corrente · da casa"
              amountCents={0}
              isArchived
            />
          </ul>
        </ArchivedToggle>
      ),
    },
  ],
}

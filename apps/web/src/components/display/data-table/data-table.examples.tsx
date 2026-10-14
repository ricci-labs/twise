import {
  DataTable,
  DataTableAmount,
  DataTableName,
} from '@web/components/display/data-table/data-table'
import type { ComponentExamples } from '@web/lib/examples.types'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'

export const dataTableExamples: ComponentExamples = {
  component: 'DataTable',
  examples: [
    {
      name: 'Contas',
      render: () => (
        <div className="w-full max-w-240">
          <DataTable
            label="Dinheiro"
            layout="accounts"
            columns={[
              { key: 'name', label: 'Conta' },
              { key: 'kind', label: 'Tipo' },
              { key: 'owner', label: 'De quem' },
              { key: 'balance', label: 'Saldo hoje', align: 'end' },
              { key: 'actions', label: 'Ações', isLabelHidden: true },
            ]}
            rows={[
              {
                key: 'x',
                cells: [
                  <DataTableName
                    key="name"
                    name="Conta X"
                    icon="wallet"
                    color={ACCOUNT_COLORS[0].value}
                    link={<a href="#conta-x">Conta X</a>}
                  />,
                  'Conta corrente',
                  'Member A',
                  <DataTableAmount key="balance" cents={420000} />,
                  null,
                ],
              },
              {
                key: 'savings',
                cells: [
                  <DataTableName key="name" name="Poupança" icon="piggy-bank" />,
                  'Poupança',
                  'Da casa',
                  <DataTableAmount key="balance" cents={1200000} />,
                  null,
                ],
              },
            ]}
          />
        </div>
      ),
    },
  ],
}

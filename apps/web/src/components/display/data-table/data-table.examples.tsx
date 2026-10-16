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
      name: 'Previstos, com os grupos em faixas',
      render: () => (
        <div className="w-full max-w-240">
          <DataTable
            label="Previstos de out/26"
            layout="occurrences"
            columns={[
              { key: 'due', label: 'Vence' },
              { key: 'name', label: 'Conta fixa' },
              { key: 'account', label: 'Conta ou cartão' },
              { key: 'status', label: 'Situação' },
              { key: 'amount', label: 'Valor', align: 'end' },
              { key: 'action', label: 'Ação', isLabelHidden: true, isActions: true },
              { key: 'more', label: 'Mais ações', isLabelHidden: true, isActions: true },
            ]}
            rows={[
              { key: 'late', band: 'Atrasados 1' },
              {
                key: 'internet',
                cells: [
                  '18/10',
                  <DataTableName key="name" name="Internet" icon="house" />,
                  'Conta X',
                  'Atrasado',
                  <DataTableAmount key="amount" cents={12000} />,
                  null,
                  null,
                ],
              },
            ]}
          />
        </div>
      ),
    },
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
    {
      name: 'Texto longo em uma tabela estreita',
      render: () => (
        <div className="w-160">
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
                key: 'joint',
                cells: [
                  <DataTableName
                    key="name"
                    name="Conta Conjunta do Banco Exemplo Internet fibra 1 giga com TV e telefone"
                    icon="wallet"
                    color={ACCOUNT_COLORS[0].value}
                    detail="Conta corrente · Fulana de Tal dos Santos Silva"
                  />,
                  'Conta corrente conjunta',
                  'Fulana de Tal dos Santos Silva',
                  <DataTableAmount key="balance" cents={123456789} />,
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

import { AuditChange } from '@web/components/display/audit-change/audit-change'
import type { ComponentExamples } from '@web/lib/examples.types'
import { LONG_TEXT } from '@web/testing/long-text'

const BOX = 'w-full max-w-100 rounded-lg border border-border bg-surface p-4'

export const auditChangeExamples: ComponentExamples = {
  component: 'AuditChange',
  examples: [
    {
      name: 'Valor editado',
      render: () => (
        <div className={BOX}>
          <AuditChange
            actorName="Member B"
            title="Member B editou o lançamento Padaria"
            detail="Hoje, 11:05 · Pela web"
            rows={[
              { label: 'Valor', before: 'R$ 18,50', after: 'R$ 21,00', isChanged: true },
              { label: 'Descrição', before: 'Padaria', after: 'Padaria', isChanged: false },
              { label: 'Data', before: '19/10/2026', after: '19/10/2026', isChanged: false },
              {
                label: 'Categoria',
                before: 'Mercado › Padaria',
                after: 'Mercado › Padaria',
                isChanged: false,
              },
              { label: 'Conta', before: 'Conta Y', after: 'Conta Y', isChanged: false },
            ]}
            reference="a91b2f07"
          />
        </div>
      ),
    },
    {
      name: 'Automático, texto longo',
      render: () => (
        <div className={BOX}>
          <AuditChange
            actorName={null}
            title={`Automático criou o previsto ${LONG_TEXT.description}`}
            detail="Ontem, 06:00 · Automático"
            rows={[
              { label: 'Descrição', before: '—', after: LONG_TEXT.description, isChanged: true },
              { label: 'Valor', before: '—', after: LONG_TEXT.amount, isChanged: true },
            ]}
            reference={null}
          />
        </div>
      ),
    },
  ],
}

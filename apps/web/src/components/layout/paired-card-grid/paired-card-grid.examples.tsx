import { Card } from '@web/components/display/card'
import { PairedCardGrid } from '@web/components/layout/paired-card-grid/paired-card-grid'
import type { ComponentExamples } from '@web/lib/examples.types'

export const pairedCardGridExamples: ComponentExamples = {
  component: 'PairedCardGrid',
  examples: [
    {
      name: 'Pares da mesma altura e um cartão na linha toda',
      render: () => (
        <PairedCardGrid>
          <Card title="Nome e moeda" description="Como o espaço aparece.">
            Casa
          </Card>
          <Card title="Calendário e fuso" description="Para lembretes e vencimentos.">
            Domingo · Brasília (GMT-3) · São Paulo, Rio, Minas, Sul e boa parte do país
          </Card>
          <Card title="Cobranças e planejamento" className="lg:col-span-2">
            Cada um tem a sua tela.
          </Card>
        </PairedCardGrid>
      ),
    },
  ],
}

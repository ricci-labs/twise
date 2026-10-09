import { Card } from '@web/components/display/card/card'
import type { ComponentExamples } from '@web/lib/examples.types'

export const cardExamples: ComponentExamples = {
  component: 'Card',
  examples: [
    {
      name: 'Com rodapé',
      render: () => (
        <Card
          title="Próximas faturas"
          description="Já lançado mais o previsto de assinaturas."
          footerStat="2 cartões"
          footerAction={<a href="#exemplo">Ver cartões</a>}
        >
          <p className="text-body">Cartão X · R$ 1.950,00</p>
        </Card>
      ),
    },
    {
      name: 'Simples',
      render: () => (
        <Card title="Avisos" description="Os mais urgentes primeiro.">
          <p className="text-body">Tudo em ordem por aqui.</p>
        </Card>
      ),
    },
  ],
}

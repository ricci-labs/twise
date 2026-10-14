import { Button } from '@web/components/actions/button'
import { PageHeader } from '@web/components/layout/page-header/page-header'
import type { ComponentExamples } from '@web/lib/examples.types'

export const pageHeaderExamples: ComponentExamples = {
  component: 'PageHeader',
  examples: [
    {
      name: 'Cartões',
      render: () => (
        <div className="w-full">
          <PageHeader
            title="Cartões"
            description="Faturas, limites e o melhor dia de comprar em cada cartão."
            actions={<Button>Novo cartão</Button>}
          />
        </div>
      ),
    },
  ],
}

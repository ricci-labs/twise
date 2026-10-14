import { SubPageHeader } from '@web/components/layout/sub-page-header/sub-page-header'
import type { ComponentExamples } from '@web/lib/examples.types'

export const subPageHeaderExamples: ComponentExamples = {
  component: 'SubPageHeader',
  examples: [
    {
      name: 'Lixeira de contas',
      render: () => (
        <div className="w-full max-w-97.5">
          <SubPageHeader
            back={<a href="#voltar" />}
            backLabel="Voltar para Contas"
            title="Lixeira de contas"
            description="Contas, cartões e categorias excluídos. Restaurar traz de volta com o histórico."
          />
        </div>
      ),
    },
  ],
}

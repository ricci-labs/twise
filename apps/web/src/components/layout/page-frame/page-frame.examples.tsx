import { PageFrame } from '@web/components/layout/page-frame/page-frame'
import type { ComponentExamples } from '@web/lib/examples.types'

export const pageFrameExamples: ComponentExamples = {
  component: 'PageFrame',
  examples: [
    {
      name: 'Com margens',
      render: () => (
        <PageFrame className="gap-4 bg-sunken">
          <p className="text-body">Contas e categorias</p>
        </PageFrame>
      ),
    },
    {
      name: 'Até a borda no celular',
      render: () => (
        <PageFrame edge="bleed" className="gap-4 bg-sunken">
          <p className="text-body">Faixa de meses da fatura</p>
        </PageFrame>
      ),
    },
  ],
}

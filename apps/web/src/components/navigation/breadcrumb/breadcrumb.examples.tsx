import { Breadcrumb } from '@web/components/navigation/breadcrumb/breadcrumb'
import type { ComponentExamples } from '@web/lib/examples.types'

export const breadcrumbExamples: ComponentExamples = {
  component: 'Breadcrumb',
  examples: [
    {
      name: 'Cartões › Cartão X',
      render: () => (
        <Breadcrumb
          label="Caminho"
          items={[
            { label: 'Cartões', link: <a href="#cartoes">Cartões</a> },
            { label: 'Cartão X' },
          ]}
        />
      ),
    },
  ],
}

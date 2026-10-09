import { ActionMenu } from '@web/components/actions/action-menu/action-menu'
import { Button } from '@web/components/actions/button'
import type { ComponentExamples } from '@web/lib/examples.types'

export const actionMenuExamples: ComponentExamples = {
  component: 'ActionMenu',
  examples: [
    {
      name: 'Trocar de espaço',
      render: () => (
        <ActionMenu
          trigger={<Button variant="outline">Casa</Button>}
          header="Seus espaços"
          groups={[
            [
              { key: 'casa', label: 'Casa', detail: 'Dono', icon: 'home', isCurrent: true },
              { key: 'pessoal', label: 'Pessoal', detail: 'Dono', icon: 'home' },
            ],
            [{ key: 'new', label: 'Criar espaço', icon: 'plus' }],
          ]}
        />
      ),
    },
  ],
}

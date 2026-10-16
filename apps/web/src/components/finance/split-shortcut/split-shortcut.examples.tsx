import { SplitShortcut } from '@web/components/finance/split-shortcut/split-shortcut'
import type { ComponentExamples } from '@web/lib/examples.types'

const TEXT = '4 passos. A próxima comissão vai primeiro para a reserva.'

export const splitShortcutExamples: ComponentExamples = {
  component: 'SplitShortcut',
  examples: [
    {
      name: 'Quem pode editar',
      render: () => (
        <div className="w-full max-w-100">
          <SplitShortcut text={TEXT} link={<a href="#divisao" />} canEdit />
        </div>
      ),
    },
    {
      name: 'Leitor',
      render: () => (
        <div className="w-full max-w-100">
          <SplitShortcut text={TEXT} link={<a href="#divisao" />} canEdit={false} />
        </div>
      ),
    },
  ],
}

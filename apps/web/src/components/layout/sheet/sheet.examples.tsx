import { Button } from '@web/components/actions/button'
import { Sheet } from '@web/components/layout/sheet/sheet'
import type { ComponentExamples } from '@web/lib/examples.types'

export const sheetExamples: ComponentExamples = {
  component: 'Sheet',
  examples: [
    {
      name: 'Mais',
      render: () => (
        <Sheet title="Mais" trigger={<Button variant="outline">Abrir</Button>}>
          <p className="text-body">Contatos e cobranças, contas, membros…</p>
        </Sheet>
      ),
    },
  ],
}

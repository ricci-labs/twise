import { LockedField } from '@web/components/forms/locked-field/locked-field'
import type { ComponentExamples } from '@web/lib/examples.types'

export const lockedFieldExamples: ComponentExamples = {
  component: 'LockedField',
  examples: [
    {
      name: 'Tipo que não muda',
      render: () => (
        <div className="w-full max-w-90">
          <LockedField
            label="Tipo"
            value="Conta corrente"
            help="O tipo não pode ser mudado depois."
          />
        </div>
      ),
    },
  ],
}

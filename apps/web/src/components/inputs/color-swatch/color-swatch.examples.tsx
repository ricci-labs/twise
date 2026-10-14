import { ColorSwatch } from '@web/components/inputs/color-swatch/color-swatch'
import type { ComponentExamples } from '@web/lib/examples.types'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'

export const colorSwatchExamples: ComponentExamples = {
  component: 'ColorSwatch',
  examples: [
    {
      name: 'Bolinha ao lado do nome',
      render: () => (
        <div className="flex items-center gap-3">
          {ACCOUNT_COLORS.map((choice) => (
            <ColorSwatch key={choice.key} color={choice.value} />
          ))}
        </div>
      ),
    },
    {
      name: 'Amostra do seletor',
      render: () => (
        <div className="flex flex-wrap gap-2.5">
          {ACCOUNT_COLORS.map((choice) => (
            <ColorSwatch key={choice.key} color={choice.value} size="swatch" />
          ))}
        </div>
      ),
    },
  ],
}

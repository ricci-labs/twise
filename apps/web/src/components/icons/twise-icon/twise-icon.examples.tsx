import { TwiseIcon } from '@web/components/icons/twise-icon/twise-icon'
import type { TwiseIconName } from '@web/components/icons/twise-icon/twise-icon.types'
import type { ComponentExamples } from '@web/lib/examples.types'

const INTERFACE_ICONS: readonly TwiseIconName[] = [
  'home',
  'list',
  'card',
  'plan',
  'menu',
  'plus',
  'users',
  'wallet',
  'user',
  'sliders',
  'history',
  'trash',
  'shield',
  'bag',
  'out',
]

const ALERT_ICONS = [
  { name: 'alert', tone: 'danger' },
  { name: 'warn', tone: 'warning' },
  { name: 'info', tone: 'info' },
  { name: 'ok', tone: 'success' },
] as const

export const twiseIconExamples: ComponentExamples = {
  component: 'TwiseIcon',
  examples: [
    {
      name: 'Em repouso',
      render: () => (
        <div className="flex flex-wrap gap-3">
          {INTERFACE_ICONS.map((name) => (
            <TwiseIcon key={name} name={name} tone="muted" />
          ))}
        </div>
      ),
    },
    {
      name: 'Selecionado',
      render: () => (
        <div className="flex flex-wrap gap-3">
          {INTERFACE_ICONS.map((name) => (
            <TwiseIcon key={name} name={name} tone="selected" />
          ))}
        </div>
      ),
    },
    {
      name: 'Avisos',
      render: () => (
        <div className="flex flex-wrap gap-3">
          {ALERT_ICONS.map(({ name, tone }) => (
            <TwiseIcon key={name} name={name} tone={tone} />
          ))}
        </div>
      ),
    },
    {
      name: 'Tamanhos',
      render: () => (
        <div className="flex items-center gap-3">
          <TwiseIcon name="home" tone="selected" size="sm" />
          <TwiseIcon name="home" tone="selected" size="md" />
          <TwiseIcon name="home" tone="selected" size="lg" />
        </div>
      ),
    },
  ],
}

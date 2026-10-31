import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { themeCardsMessages as messages } from '@web/components/inputs/theme-cards/theme-cards.messages'
import type {
  ThemeCardsProps,
  ThemeMiniatureProps,
} from '@web/components/inputs/theme-cards/theme-cards.types'
import {
  themeCardDetailVariants,
  themeCardsVariants,
  themeCardTitleVariants,
  themeCardVariants,
  themeMiniatureBarVariants,
  themeMiniatureVariants,
} from '@web/components/inputs/theme-cards/theme-cards.variants'
import { cn } from '@web/lib/cn'
import type { ThemeChoice } from '@web/lib/theme.types'

const CHOICES: readonly ThemeChoice[] = ['light', 'dark', 'system']

export function ThemeCards({ label, value, onChange, size, className }: ThemeCardsProps) {
  return (
    <RadioGroup
      data-slot="theme-cards"
      aria-label={label}
      value={value}
      onValueChange={(next) => onChange(CHOICES.find((choice) => choice === next) ?? 'light')}
      className={cn(themeCardsVariants({ size }), className)}
    >
      {CHOICES.map((choice) => (
        <Radio.Root
          key={choice}
          value={choice}
          nativeButton
          render={<button type="button" />}
          aria-label={messages[choice].title}
          className={themeCardVariants()}
        >
          <ThemeMiniature choice={choice} size={size} />
          <span className={themeCardTitleVariants()}>{messages[choice].title}</span>
          <span className={themeCardDetailVariants()}>{messages[choice].detail}</span>
        </Radio.Root>
      ))}
    </RadioGroup>
  )
}

function ThemeMiniature({ choice, size }: ThemeMiniatureProps) {
  return (
    <span aria-hidden="true" className={themeMiniatureVariants({ choice, size })}>
      <span className={themeMiniatureBarVariants({ tone: 'mint' })} />
      <span className={themeMiniatureBarVariants({ tone: 'line' })} />
      <span className={themeMiniatureBarVariants({ tone: 'short' })} />
    </span>
  )
}

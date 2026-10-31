import type { VerdictProps } from '@web/components/display/verdict/verdict.types'
import {
  verdictIconVariants,
  verdictSentenceVariants,
  verdictTextVariants,
  verdictTitleVariants,
  verdictVariants,
} from '@web/components/display/verdict/verdict.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'

const ICONS = { ok: 'ok', warn: 'warn', alert: 'alert' } as const

export function Verdict({ tone, title, text }: VerdictProps) {
  return (
    <div data-slot="verdict" data-tone={tone} className={verdictVariants({ tone })}>
      <span aria-hidden="true" className={verdictIconVariants({ tone })}>
        <TwiseIcon name={ICONS[tone]} size="xl" />
      </span>
      <p className={verdictTextVariants()}>
        <strong data-slot="verdict-title" className={verdictTitleVariants()}>
          {title}
        </strong>
        <span className={verdictSentenceVariants()}>{text}</span>
      </p>
    </div>
  )
}

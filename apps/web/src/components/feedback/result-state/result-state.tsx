import { MetaLine } from '@web/components/display/meta-line'
import type { ResultStateProps } from '@web/components/feedback/result-state/result-state.types'
import {
  resultStateActionVariants,
  resultStateArtVariants,
  resultStateDetailVariants,
  resultStateTextVariants,
  resultStateTitleVariants,
  resultStateVariants,
} from '@web/components/feedback/result-state/result-state.variants'

export function ResultState({
  art,
  title,
  text,
  detail,
  action,
  frame,
  tone,
  isAlert = false,
}: ResultStateProps) {
  return (
    <section
      data-slot="result-state"
      role={isAlert ? 'alert' : undefined}
      aria-label={isAlert ? undefined : title}
      className={resultStateVariants({ frame })}
    >
      <span aria-hidden="true" className={resultStateArtVariants({ tone })}>
        {art}
      </span>
      <strong className={resultStateTitleVariants()}>{title}</strong>
      <p className={resultStateTextVariants()}>{text}</p>
      {detail && (
        <small className={resultStateDetailVariants()}>
          <MetaLine text={detail} />
        </small>
      )}
      {action && <div className={resultStateActionVariants()}>{action}</div>}
    </section>
  )
}

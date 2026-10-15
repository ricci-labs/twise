import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { Button } from '@web/components/actions/button'
import { RichText } from '@web/components/display/rich-text'
import { Alert } from '@web/components/feedback/alert'
import type {
  MatchOptionCardProps,
  MatchQuestionProps,
} from '@web/components/finance/match-question/match-question.types'
import {
  matchOptionDetailVariants,
  matchOptionsVariants,
  matchOptionTitleVariants,
  matchOptionVariants,
  matchQuestionActionsVariants,
  matchQuestionTextVariants,
  matchQuestionVariants,
} from '@web/components/finance/match-question/match-question.variants'
import { Sheet } from '@web/components/layout/sheet'

export function MatchQuestion({
  title,
  lead,
  note,
  options,
  optionsLabel,
  value,
  onValueChange,
  isOpen,
  onOpenChange,
  declineLabel,
  confirmLabel,
  onDecline,
  onConfirm,
  isConfirming = false,
  problem,
}: MatchQuestionProps) {
  const [only] = options
  return (
    <Sheet title={title} isOpen={isOpen} onOpenChange={onOpenChange}>
      <div data-slot="match-question" className={matchQuestionVariants()}>
        {problem && <Alert tone="danger">{problem}</Alert>}
        {lead && (
          <p className={matchQuestionTextVariants()}>
            <RichText text={lead} />
          </p>
        )}
        {options.length === 1 && only ? (
          <OptionCard option={only} />
        ) : (
          <RadioGroup
            aria-label={optionsLabel}
            value={value}
            onValueChange={(next) => onValueChange(String(next))}
            className={matchOptionsVariants()}
          >
            {options.map((option) => (
              <Radio.Root
                key={option.value}
                value={option.value}
                nativeButton
                render={<button type="button" />}
                className={matchOptionVariants({ isChoice: true })}
              >
                <span className={matchOptionTitleVariants()}>{option.title}</span>
                <span className={matchOptionDetailVariants()}>{option.detail}</span>
              </Radio.Root>
            ))}
          </RadioGroup>
        )}
        {note && (
          <p className={matchQuestionTextVariants()}>
            <RichText text={note} />
          </p>
        )}
        <div className={matchQuestionActionsVariants()}>
          <Button variant="secondary" onClick={onDecline}>
            {declineLabel}
          </Button>
          <Button isLoading={isConfirming} isDisabled={value === null} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

function OptionCard({ option }: MatchOptionCardProps) {
  return (
    <div className={matchOptionVariants()}>
      <span className={matchOptionTitleVariants()}>{option.title}</span>
      <span className={matchOptionDetailVariants()}>{option.detail}</span>
    </div>
  )
}

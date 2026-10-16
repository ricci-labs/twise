import { Amount } from '@web/components/display/amount'
import { splitExampleMessages as messages } from '@web/components/finance/split-example/split-example.messages'
import type {
  SplitBarProps,
  SplitBarSegment,
  SplitExampleChoice,
  SplitExamplePart,
  SplitExampleProps,
  SplitPartRowProps,
  SplitSeries,
} from '@web/components/finance/split-example/split-example.types'
import {
  splitAmountVariants,
  splitBarSvgVariants,
  splitBarVariants,
  splitCustomVariants,
  splitExampleVariants,
  splitFootnoteVariants,
  splitLabelVariants,
  splitLeaderVariants,
  splitNumberVariants,
  splitRowsVariants,
  splitRowVariants,
  splitSegmentVariants,
  splitTitleVariants,
  splitWithVariants,
} from '@web/components/finance/split-example/split-example.variants'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { MoneyInput } from '@web/components/inputs/money-input'
import { cn } from '@web/lib/cn'
import { useId } from 'react'

const ALL_CHOICES: readonly SplitExampleChoice[] = ['current', 'average', 'custom']
const SERIES: readonly SplitSeries[] = ['s1', 's2', 's3', 's4', 's5']
const FULL = 100
const GAP = 0.75

export function SplitExample({
  choice,
  onChoiceChange,
  choices = ALL_CHOICES,
  customAmount,
  onCustomAmountChange,
  amountCents,
  parts,
  leftoverCents,
  hasBar = false,
  title = messages.title,
  footnote = messages.footnote,
  className,
}: SplitExampleProps) {
  const titleId = useId()
  const choose = (value: string) => {
    const picked = choices.find((option) => option === value)
    if (picked) {
      onChoiceChange(picked)
    }
  }
  return (
    <section
      data-slot="split-example"
      aria-labelledby={titleId}
      className={cn(splitExampleVariants(), className)}
    >
      <h2 id={titleId} className={splitTitleVariants()}>
        {title}
      </h2>
      <ChoiceChips
        label={messages.choicesLabel}
        variant="pillOutline"
        size="compact"
        value={choice}
        onSelect={choose}
        options={choices.map((option) => ({ value: option, label: messages.choices[option] }))}
      />
      {choice === 'custom' && (
        <MoneyInput
          aria-label={messages.customAmount}
          value={customAmount}
          onChange={(event) => onCustomAmountChange(event.target.value)}
          className={splitCustomVariants()}
        />
      )}
      <p className={splitWithVariants()}>
        {messages.withAmount}{' '}
        <strong>
          <Amount cents={amountCents} size="inherit" />
        </strong>{' '}
        {messages.choiceNotes[choice]}
      </p>
      {hasBar && <SplitBar parts={parts} leftoverCents={leftoverCents} />}
      <ul className={splitRowsVariants()}>
        {parts.map((part) => (
          <SplitPartRow key={part.position} part={part} hasBar={hasBar} />
        ))}
        <li className={splitRowVariants({ isLeftover: true })}>
          <span>{messages.leftover}</span>
          <span aria-hidden="true" className={splitLeaderVariants()} />
          <Amount cents={leftoverCents} size="inherit" className={splitAmountVariants()} />
        </li>
      </ul>
      <p className={splitFootnoteVariants()}>{footnote}</p>
    </section>
  )
}

function SplitPartRow({ part, hasBar }: SplitPartRowProps) {
  return (
    <li className={splitRowVariants()}>
      <span className={splitNumberVariants({ series: hasBar ? seriesOf(part.position) : 'plain' })}>
        {part.position}
      </span>
      <span className={splitLabelVariants()}>{part.label}</span>
      <span aria-hidden="true" className={splitLeaderVariants()} />
      {part.amountCents === null ? (
        <span className={splitAmountVariants()}>
          <span aria-hidden="true">{messages.skipped}</span>
          <span className="sr-only">{messages.skippedHint}</span>
        </span>
      ) : (
        <Amount cents={part.amountCents} size="inherit" className={splitAmountVariants()} />
      )}
    </li>
  )
}

function SplitBar({ parts, leftoverCents }: SplitBarProps) {
  const segments = barSegments(parts, leftoverCents)
  return (
    <span className={splitBarVariants()}>
      <svg aria-hidden="true" className={splitBarSvgVariants()} preserveAspectRatio="none">
        {segments.map((segment) => (
          <rect
            key={segment.key}
            x={`${segment.start}%`}
            y="0"
            width={`${segment.width}%`}
            height="100%"
            className={splitSegmentVariants({ series: segment.series })}
          />
        ))}
      </svg>
    </span>
  )
}

function seriesOf(position: number): SplitSeries {
  return SERIES[(position - 1) % SERIES.length] ?? 's1'
}

function barSegments(parts: readonly SplitExamplePart[], leftoverCents: number): SplitBarSegment[] {
  const pieces = [
    ...parts.flatMap((part) =>
      part.amountCents && part.amountCents > 0
        ? [
            {
              key: `step-${part.position}`,
              series: seriesOf(part.position),
              cents: part.amountCents,
            },
          ]
        : [],
    ),
    ...(leftoverCents > 0
      ? [{ key: 'leftover', series: 'leftover' as const, cents: leftoverCents }]
      : []),
  ]
  const total = pieces.reduce((sum, piece) => sum + piece.cents, 0)
  if (total === 0) {
    return [{ key: 'leftover', series: 'leftover', start: 0, width: FULL }]
  }
  const last = pieces.length - 1
  return pieces.map((piece, index) => {
    const before = pieces.slice(0, index).reduce((sum, earlier) => sum + earlier.cents, 0)
    const leadingGap = index > 0 ? GAP / 2 : 0
    const trailingGap = index < last ? GAP / 2 : 0
    return {
      key: piece.key,
      series: piece.series,
      start: (before / total) * FULL + leadingGap,
      width: Math.max((piece.cents / total) * FULL - leadingGap - trailingGap, 0),
    }
  })
}

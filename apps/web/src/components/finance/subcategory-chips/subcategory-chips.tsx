import { SubcategoryChip } from '@web/components/finance/subcategory-chip'
import { subcategoryChipsMessages as messages } from '@web/components/finance/subcategory-chips/subcategory-chips.messages'
import type {
  ChipWidths,
  SubcategoryChipsProps,
} from '@web/components/finance/subcategory-chips/subcategory-chips.types'
import {
  subcategoryChipsMeasureRowVariants,
  subcategoryChipsMeasureVariants,
  subcategoryChipsToggleVariants,
  subcategoryChipsVariants,
} from '@web/components/finance/subcategory-chips/subcategory-chips.variants'
import { ChevronUp } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const CHIP_SELECTOR = ':scope > [data-slot=subcategory-chip]'

export function SubcategoryChips({
  labels,
  chips,
  add,
  isExpanded,
  onExpandedChange,
  onHiddenCountChange,
}: SubcategoryChipsProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [fitCount, setFitCount] = useState(labels.length)
  const hiddenCount = Math.max(labels.length - fitCount, 0)

  useLayoutEffect(() => {
    const box = boxRef.current
    const measure = measureRef.current
    if (!(box && measure)) {
      return
    }
    const update = () => setFitCount(fittingCount(box.clientWidth, widthsOf(measure)))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(box)
    observer.observe(measure)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    onHiddenCountChange?.(hiddenCount)
  }, [hiddenCount, onHiddenCountChange])

  const isShowingAll = isExpanded || hiddenCount === 0
  return (
    <div ref={boxRef} data-slot="subcategory-chips" className={subcategoryChipsVariants()}>
      {isShowingAll ? chips : chips.slice(0, fitCount)}
      {!isShowingAll && (
        <button
          type="button"
          aria-expanded={false}
          className={subcategoryChipsToggleVariants({ intent: 'more' })}
          onClick={() => onExpandedChange(true)}
        >
          {messages.more(hiddenCount)}
        </button>
      )}
      {add}
      {isExpanded && hiddenCount > 0 && (
        <button
          type="button"
          aria-expanded
          className={subcategoryChipsToggleVariants({ intent: 'less' })}
          onClick={() => onExpandedChange(false)}
        >
          {messages.less}
          <ChevronUp aria-hidden="true" />
        </button>
      )}
      <div aria-hidden="true" className={subcategoryChipsMeasureVariants()}>
        <div ref={measureRef} className={subcategoryChipsMeasureRowVariants()}>
          {labels.map((label) => (
            <SubcategoryChip key={label} label={label} tone="plain" />
          ))}
          <span className={subcategoryChipsToggleVariants({ intent: 'more' })}>
            {messages.more(labels.length)}
          </span>
          {add}
        </div>
      </div>
    </div>
  )
}

function widthsOf(measure: HTMLElement): ChipWidths {
  const chipCount = measure.querySelectorAll(CHIP_SELECTOR).length
  const widths = Array.from(measure.children, (child) => (child as HTMLElement).offsetWidth)
  const gap = Number.parseFloat(getComputedStyle(measure).columnGap) || 0
  return {
    chips: widths.slice(0, chipCount),
    more: widths[chipCount] ?? 0,
    add: widths[chipCount + 1] ?? 0,
    gap,
  }
}

function fittingCount(available: number, widths: ChipWidths): number {
  const tail = widths.add > 0 ? widths.add + widths.gap : 0
  const all = widths.chips.reduce((total, width) => total + width + widths.gap, 0) + tail
  if (all - widths.gap <= available) {
    return widths.chips.length
  }
  let used = widths.more + tail
  let count = 0
  for (const width of widths.chips) {
    used += width + widths.gap
    if (used > available) {
      break
    }
    count += 1
  }
  return count
}

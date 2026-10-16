import type { DragReorderOptions, DragState, GripHandlers } from '@web/hooks/use-drag-reorder.types'
import { useRef, useState } from 'react'

const HALF = 2

export function useDragReorder({ count, lastMovable, onMove }: DragReorderOptions) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const rows = useRef<(HTMLElement | null)[]>([])

  function targetAt(clientY: number): number {
    const middles = rows.current
      .slice(0, count)
      .map((row) => (row ? row.getBoundingClientRect() : null))
      .map((rect) => (rect ? rect.top + rect.height / HALF : Number.POSITIVE_INFINITY))
    const below = middles.findIndex((middle) => clientY < middle)
    const index = below === -1 ? count - 1 : below
    return Math.min(index, lastMovable)
  }

  function gripOf(index: number): GripHandlers {
    return {
      onPointerDown: (event) => {
        if (index > lastMovable) {
          return
        }
        event.currentTarget.setPointerCapture(event.pointerId)
        setDrag({ from: index, to: index })
      },
      onPointerMove: (event) => {
        if (drag) {
          setDrag({ ...drag, to: targetAt(event.clientY) })
        }
      },
      onPointerUp: () => {
        if (drag && drag.from !== drag.to) {
          onMove(drag.from, drag.to)
        }
        setDrag(null)
      },
      onPointerCancel: () => setDrag(null),
    }
  }

  function rowRef(index: number) {
    return (element: HTMLElement | null) => {
      rows.current[index] = element
    }
  }

  return { drag, gripOf, rowRef }
}

export function moved<Item>(items: readonly Item[], from: number, to: number): Item[] {
  const next = [...items]
  const [item] = next.splice(from, 1)
  if (item !== undefined) {
    next.splice(to, 0, item)
  }
  return next
}

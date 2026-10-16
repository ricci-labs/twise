import type { PointerEvent } from 'react'

export type DragReorderOptions = {
  count: number
  lastMovable: number
  onMove: (from: number, to: number) => void
}

export type DragState = {
  from: number
  to: number
}

export type GripHandlers = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void
  onPointerMove: (event: PointerEvent<HTMLElement>) => void
  onPointerUp: () => void
  onPointerCancel: () => void
}

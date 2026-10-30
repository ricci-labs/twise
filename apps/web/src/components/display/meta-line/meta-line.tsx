import { metaLineMessages } from '@web/components/display/meta-line/meta-line.messages'
import type {
  LineRoom,
  MetaLayout,
  MetaLineProps,
  MetaPiece,
  PieceWidths,
} from '@web/components/display/meta-line/meta-line.types'
import {
  metaLineHiddenDotVariants,
  metaLinePieceVariants,
} from '@web/components/display/meta-line/meta-line.variants'
import { Fragment, useLayoutEffect, useRef, useState } from 'react'

const LOCALE = 'pt-BR'
const SPACE = ' '
const CANVAS_TAG = 'canvas'
const CANVAS_CONTEXT = '2d'
const ONE_LINE_LAYOUT: MetaLayout = { lineStarts: new Set(), tooWide: new Set() }
const NO_WIDTHS: PieceWidths = { space: 0, first: 0, withDot: [], startingLine: [] }

let textMeasurer: CanvasRenderingContext2D | null = null

export function MetaLine({ text }: MetaLineProps) {
  const lineRef = useRef<HTMLSpanElement>(null)
  const [layout, setLayout] = useState(ONE_LINE_LAYOUT)
  const pieces = keyedPieces(text)

  useLayoutEffect(() => {
    const line = lineRef.current
    const box = line?.parentElement
    if (!(line && box && text)) {
      return
    }
    const pieceTexts = text.split(metaLineMessages.separator)
    const update = () => {
      const room = { width: box.clientWidth, firstLineInset: firstLineInset(box, line) }
      const widths = widthsOf(pieceTexts, getComputedStyle(line))
      setLayout((shown) => keepIfSame(shown, layoutFor(room, widths)))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(box)
    void document.fonts.ready.then(update)
    return () => observer.disconnect()
  }, [text])

  return (
    <span ref={lineRef} data-slot="meta-line">
      {pieces.map(({ key, text: piece }, index) => {
        const startsLine = layout.lineStarts.has(index)
        return (
          <Fragment key={key}>
            {index > 0 && (startsLine ? <LineBreak /> : SPACE)}
            <span
              data-slot="meta-piece"
              className={metaLinePieceVariants({ fits: !layout.tooWide.has(index) })}
            >
              {pieceText(piece, index, startsLine)}
            </span>
          </Fragment>
        )
      })}
    </span>
  )
}

function LineBreak() {
  return (
    <>
      <span className={metaLineHiddenDotVariants()}>{metaLineMessages.separator}</span>
      <br />
    </>
  )
}

function keyedPieces(text: string): MetaPiece[] {
  const seen = new Map<string, number>()
  return text.split(metaLineMessages.separator).map((piece) => {
    const occurrence = (seen.get(piece) ?? 0) + 1
    seen.set(piece, occurrence)
    return { key: `${piece}#${occurrence}`, text: piece }
  })
}

function pieceText(piece: string, index: number, startsLine: boolean): string {
  if (index === 0) {
    return piece
  }
  if (startsLine) {
    return piece.charAt(0).toLocaleUpperCase(LOCALE) + piece.slice(1)
  }
  return metaLineMessages.dot + piece
}

function widthsOf(pieces: string[], style: CSSStyleDeclaration): PieceWidths {
  textMeasurer ??= document.createElement(CANVAS_TAG).getContext(CANVAS_CONTEXT)
  const measurer = textMeasurer
  if (!measurer) {
    return NO_WIDTHS
  }
  measurer.font = style.font
  measurer.letterSpacing = style.letterSpacing
  const widthOf = (value: string) => measurer.measureText(value).width
  const withDot = pieces.map((piece, index) => widthOf(pieceText(piece, index, false)))
  return {
    space: widthOf(SPACE),
    first: withDot[0] ?? 0,
    withDot,
    startingLine: pieces.map((piece, index) => widthOf(pieceText(piece, index, true))),
  }
}

function firstLineInset(box: HTMLElement, line: HTMLElement): number {
  const firstPiece = line.firstElementChild
  if (!firstPiece) {
    return 0
  }
  return firstPiece.getBoundingClientRect().left - box.getBoundingClientRect().left
}

function layoutFor(room: LineRoom, widths: PieceWidths): MetaLayout {
  return { lineStarts: lineStartsFor(room, widths), tooWide: tooWideFor(room, widths) }
}

function tooWideFor(room: LineRoom, widths: PieceWidths): ReadonlySet<number> {
  const tooWide = new Set<number>()
  widths.startingLine.forEach((width, index) => {
    if (width > room.width) {
      tooWide.add(index)
    }
  })
  return tooWide
}

function lineStartsFor(room: LineRoom, widths: PieceWidths): ReadonlySet<number> {
  const starts = new Set<number>()
  let used = room.firstLineInset + widths.first
  for (let index = 1; index < widths.withDot.length; index++) {
    const joined = used + widths.space + (widths.withDot[index] ?? 0)
    if (joined <= room.width) {
      used = joined
      continue
    }
    starts.add(index)
    used = widths.startingLine[index] ?? 0
  }
  return starts
}

function keepIfSame(shown: MetaLayout, measured: MetaLayout): MetaLayout {
  const isSame =
    hasSameIndexes(shown.lineStarts, measured.lineStarts) &&
    hasSameIndexes(shown.tooWide, measured.tooWide)
  return isSame ? shown : measured
}

function hasSameIndexes(shown: ReadonlySet<number>, measured: ReadonlySet<number>): boolean {
  return shown.size === measured.size && [...measured].every((index) => shown.has(index))
}

export type MetaLineProps = {
  text: string
}

export type MetaPiece = {
  key: string
  text: string
}

export type PieceWidths = {
  space: number
  first: number
  withDot: number[]
  startingLine: number[]
}

export type LineRoom = {
  width: number
  firstLineInset: number
}

export type MetaLayout = {
  lineStarts: ReadonlySet<number>
  tooWide: ReadonlySet<number>
}

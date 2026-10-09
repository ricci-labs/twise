export type PaceRingProps = {
  usedPercent: number
  elapsedPercent?: number
  centerLabel: string
  centerCaption?: string
  description: string
  size?: 'md' | 'sm'
  className?: string
}

export type RingArcProps = {
  radius: number
  percent: number
  className: string
}

export type RingTrackProps = {
  radius: number
}

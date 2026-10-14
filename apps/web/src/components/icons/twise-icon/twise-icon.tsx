import type {
  TwiseIconName,
  TwiseIconProps,
  TwiseIconShape,
} from '@web/components/icons/twise-icon/twise-icon.types'
import { twiseIconVariants } from '@web/components/icons/twise-icon/twise-icon.variants'
import { cn } from '@web/lib/cn'

export function TwiseIcon({ name, tone, size, className }: TwiseIconProps) {
  const { fill, stroke, weight = DRAWN_WEIGHT } = TWISE_ICON_SHAPES[name]
  return (
    <svg
      data-slot="icon"
      data-icon={name}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(twiseIconVariants({ tone, size }), className)}
    >
      {fill && (
        <g data-slot="icon-fill" stroke="none">
          {fill}
        </g>
      )}
      {stroke}
    </svg>
  )
}

const DRAWN_WEIGHT = 1.75

const LINE_WEIGHT = 2

const TWISE_ICON_SHAPES: Record<TwiseIconName, TwiseIconShape> = {
  alert: {
    fill: (
      <>
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    stroke: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.6v5.1M12 16.3h.01" />
      </>
    ),
  },
  archive: {
    weight: LINE_WEIGHT,
    stroke: (
      <>
        <rect x="2" y="4" width="20" height="5" rx="1" />
        <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9M10 13h4" />
      </>
    ),
  },
  bag: {
    fill: (
      <>
        <path d="M5.2 8h13.6l.9 11a1.6 1.6 0 0 1-1.6 1.7H5.9A1.6 1.6 0 0 1 4.3 19z" />
      </>
    ),
    stroke: (
      <>
        <path d="M5.2 8h13.6l.9 11a1.6 1.6 0 0 1-1.6 1.7H5.9A1.6 1.6 0 0 1 4.3 19z" />
        <path d="M8.8 8V6.8a3.2 3.2 0 0 1 6.4 0V8" />
      </>
    ),
  },
  calendar: {
    weight: LINE_WEIGHT,
    stroke: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  },
  card: {
    fill: (
      <>
        <rect x="2.8" y="5.5" width="18.4" height="13" rx="2.8" />
      </>
    ),
    stroke: (
      <>
        <rect x="2.8" y="5.5" width="18.4" height="13" rx="2.8" />
        <path d="M2.8 10h18.4M6.5 14.8h3.5" />
      </>
    ),
  },
  edit: {
    weight: LINE_WEIGHT,
    stroke: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </>
    ),
  },
  flag: {
    weight: LINE_WEIGHT,
    stroke: (
      <>
        <path d="M4 22V4M4 4h12l-2 4 2 4H4" />
      </>
    ),
  },
  history: {
    fill: (
      <>
        <circle cx="12" cy="12" r="8.4" />
      </>
    ),
    stroke: (
      <>
        <path d="M3.6 12a8.4 8.4 0 1 0 2.5-6L3.6 8.4" />
        <path d="M3.6 4v4.4H8M12 7.8V12l3 2" />
      </>
    ),
  },
  home: {
    fill: (
      <>
        <path d="M4.6 10.3v8.5a1.7 1.7 0 0 0 1.7 1.7h11.4a1.7 1.7 0 0 0 1.7-1.7v-8.5a1.7 1.7 0 0 0-.6-1.3l-5.7-4.7a1.7 1.7 0 0 0-2.2 0L5.2 9a1.7 1.7 0 0 0-.6 1.3z" />
      </>
    ),
    stroke: (
      <>
        <path d="M4.6 10.3v8.5a1.7 1.7 0 0 0 1.7 1.7h11.4a1.7 1.7 0 0 0 1.7-1.7v-8.5a1.7 1.7 0 0 0-.6-1.3l-5.7-4.7a1.7 1.7 0 0 0-2.2 0L5.2 9a1.7 1.7 0 0 0-.6 1.3z" />
        <path d="M9.8 20.5v-4.3a2.2 2.2 0 0 1 4.4 0v4.3" />
      </>
    ),
  },
  info: {
    fill: (
      <>
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    stroke: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11.2v5.2M12 7.8h.01" />
      </>
    ),
  },
  list: {
    fill: (
      <>
        <rect x="5" y="3.5" width="14" height="16" rx="1.6" />
      </>
    ),
    stroke: (
      <>
        <path d="M6.2 3.5h11.6c.7 0 1.2.5 1.2 1.2v15.8l-2.3-1.4-2.4 1.4-2.3-1.4-2.3 1.4-2.4-1.4L5 20.5V4.7c0-.7.5-1.2 1.2-1.2z" />
        <path d="M8.8 8.5h6.4M8.8 12.5h3.8M15.2 12.5h.01" />
      </>
    ),
  },
  lock: {
    weight: LINE_WEIGHT,
    stroke: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
  },
  menu: {
    stroke: (
      <>
        <path d="M4.5 7h15M4.5 12h15M4.5 17h9" />
      </>
    ),
  },
  more: {
    weight: LINE_WEIGHT,
    stroke: (
      <>
        <circle cx="5" cy="12" r="1.2" />
        <circle cx="12" cy="12" r="1.2" />
        <circle cx="19" cy="12" r="1.2" />
      </>
    ),
  },
  move: {
    weight: LINE_WEIGHT,
    stroke: (
      <>
        <path d="M5 9 2 12l3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
      </>
    ),
  },
  ok: {
    fill: (
      <>
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    stroke: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.2 12.3 2.6 2.6 5-5.3" />
      </>
    ),
  },
  out: {
    fill: (
      <>
        <rect x="4.5" y="3.5" width="6.5" height="17" rx="1.8" />
      </>
    ),
    stroke: (
      <>
        <path d="M10 20.5H6.3a1.8 1.8 0 0 1-1.8-1.8V5.3a1.8 1.8 0 0 1 1.8-1.8H10M10 12h10.2M16.4 8.2 20.2 12l-3.8 3.8" />
      </>
    ),
  },
  plan: {
    fill: (
      <>
        <rect x="3.8" y="5" width="16.4" height="15.5" rx="2.8" />
      </>
    ),
    stroke: (
      <>
        <rect x="3.8" y="5" width="16.4" height="15.5" rx="2.8" />
        <path d="M8 3v4M16 3v4M3.8 10h16.4M9.2 15.2l2 2 3.8-3.9" />
      </>
    ),
  },
  plus: {
    stroke: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
  },
  refresh: {
    weight: LINE_WEIGHT,
    stroke: (
      <>
        <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
        <path d="M21 3v5h-5" />
      </>
    ),
  },
  restore: {
    weight: LINE_WEIGHT,
    stroke: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
      </>
    ),
  },
  shield: {
    fill: (
      <>
        <path d="M12 3.2 19 6v6c0 4.4-3 7.4-7 8.8-4-1.4-7-4.4-7-8.8V6z" />
      </>
    ),
    stroke: (
      <>
        <path d="M12 3.2 19 6v6c0 4.4-3 7.4-7 8.8-4-1.4-7-4.4-7-8.8V6z" />
        <path d="m9 12 2.2 2.2 3.9-4" />
      </>
    ),
  },
  sliders: {
    fill: (
      <>
        <circle cx="15" cy="7" r="2.4" />
        <circle cx="9" cy="12" r="2.4" />
        <circle cx="13.5" cy="17" r="2.4" />
      </>
    ),
    stroke: (
      <>
        <path d="M4 7h8.6M17.4 7H20M4 12h2.6M11.4 12H20M4 17h7.1M15.9 17H20" />
        <circle cx="15" cy="7" r="2.4" />
        <circle cx="9" cy="12" r="2.4" />
        <circle cx="13.5" cy="17" r="2.4" />
      </>
    ),
  },
  subcategory: {
    weight: LINE_WEIGHT,
    stroke: (
      <>
        <path d="M6 3v12a3 3 0 0 0 3 3h11" />
        <path d="m16 14 4 4-4 4" />
      </>
    ),
  },
  trash: {
    fill: (
      <>
        <path d="m6.2 6.5.9 12.4a1.8 1.8 0 0 0 1.8 1.6h6.2a1.8 1.8 0 0 0 1.8-1.6l.9-12.4z" />
      </>
    ),
    stroke: (
      <>
        <path d="M4 6.5h16M9.5 6.5V4.8c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v1.7M6.2 6.5l.9 12.4a1.8 1.8 0 0 0 1.8 1.6h6.2a1.8 1.8 0 0 0 1.8-1.6l.9-12.4M10.2 10.5v6M13.8 10.5v6" />
      </>
    ),
  },
  unarchive: {
    weight: LINE_WEIGHT,
    stroke: (
      <>
        <rect x="2" y="4" width="20" height="5" rx="1" />
        <path d="M4 9v9a2 2 0 0 0 2 2h3M20 9v9a2 2 0 0 1-2 2h-3M9 16l3-3 3 3M12 13v8" />
      </>
    ),
  },
  user: {
    fill: (
      <>
        <circle cx="12" cy="8" r="3.8" />
      </>
    ),
    stroke: (
      <>
        <circle cx="12" cy="8" r="3.8" />
        <path d="M5 20.5v-.7a5.8 5.8 0 0 1 5.8-5.8h2.4a5.8 5.8 0 0 1 5.8 5.8v.7" />
      </>
    ),
  },
  users: {
    fill: (
      <>
        <circle cx="9" cy="8" r="3.4" />
      </>
    ),
    stroke: (
      <>
        <circle cx="9" cy="8" r="3.4" />
        <path d="M3 20v-.8A5 5 0 0 1 8 14.2h2a5 5 0 0 1 5 5v.8M16 4.6a3.3 3.3 0 0 1 0 6.4M18.2 14.5a4.8 4.8 0 0 1 2.8 4.4v1.1" />
      </>
    ),
  },
  wallet: {
    fill: (
      <>
        <rect x="3.5" y="6.5" width="17" height="13.5" rx="2.8" />
      </>
    ),
    stroke: (
      <>
        <rect x="3.5" y="6.5" width="17" height="13.5" rx="2.8" />
        <path d="m5.8 6.5 9.4-2.9a1 1 0 0 1 1.3 1v1.9" />
        <rect x="14.5" y="10.8" width="6" height="4.8" rx="2" />
        <path d="M16.9 13.2h.01" />
      </>
    ),
  },
  warn: {
    fill: (
      <>
        <path d="M10.3 4.3 2.9 17.4a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" />
      </>
    ),
    stroke: (
      <>
        <path d="M10.3 4.3 2.9 17.4a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" />
        <path d="M12 9.3v4.2M12 16.8h.01" />
      </>
    ),
  },
}

import { BRAND_COLORS } from '@api/core/email/brand-colors.gen'
import type {
  EmailBlock,
  EmailContent,
  EmailIllustration,
  EmailLink,
  EmailParagraph,
  EmailSpan,
  RenderedEmail,
} from '@api/core/email/email.types'

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const EMAIL_IMAGES_PATH = '/email/'
const ILLUSTRATION_FILES: Record<EmailIllustration, string> = {
  envelope: 'owl-envelope.png',
  welcome: 'owl-welcome.png',
  key: 'owl-key.png',
  padlock: 'owl-padlock.png',
  invitation: 'owl-invitation.png',
  together: 'owl-together.png',
}
const LOGO_FILE = 'twise-logo.png'
const LOGO_ALT = 'twise'
const LOGO_HEIGHT_PX = 28
const ILLUSTRATION_HEIGHT_PX = 172
const FALLBACK_LINE = 'Se o botão não abrir, copie este endereço no navegador:'
const FOOTER_BRAND = 'Twise'
const FOOTER_SLOGAN = ' · Leve, claro, a dois.'

const SANS = 'Figtree,Arial,Helvetica,sans-serif'
const DISPLAY = "'Bricolage Grotesque',Arial,Helvetica,sans-serif"
const STYLES = {
  body: `margin:0;padding:0;background:${BRAND_COLORS.page}`,
  preheader: 'display:none;max-height:0;overflow:hidden;opacity:0',
  outer: `background:${BRAND_COLORS.page};padding:28px 16px 32px;font-family:${SANS};color:${BRAND_COLORS.ink}`,
  card: `background:${BRAND_COLORS.surface};border:1px solid ${BRAND_COLORS.border};border-radius:20px;overflow:hidden`,
  art: `background:${BRAND_COLORS.mint};height:188px;padding-top:16px;text-align:center;vertical-align:bottom`,
  content: 'padding:28px 32px 8px',
  greeting: `margin:0 0 6px;font-size:15px;line-height:22px;color:${BRAND_COLORS.inkMuted}`,
  heading: `margin:0 0 12px;font-family:${DISPLAY};font-weight:750;font-size:28px;line-height:34px;letter-spacing:-0.02em;color:${BRAND_COLORS.ink}`,
  paragraph: 'margin:0 0 12px;font-size:16px;line-height:24px',
  button: `display:inline-block;margin:8px 0 4px;padding:13px 26px;border-radius:999px;background:${BRAND_COLORS.actionPrimary};color:${BRAND_COLORS.onActionPrimary};font-weight:650;font-size:16px;line-height:22px;text-decoration:none`,
  fallback: `margin:12px 0 0;font-size:13px;line-height:18px;color:${BRAND_COLORS.inkMuted};word-break:break-all`,
  link: `color:${BRAND_COLORS.mintInk};font-weight:600`,
  notes: `margin:20px 32px 0;padding:16px 0 24px;border-top:1px solid ${BRAND_COLORS.border}`,
  note: `margin:0 0 6px;font-size:13px;line-height:19px;color:${BRAND_COLORS.inkMuted}`,
  footer: `padding:16px 0 0;font-size:12px;line-height:18px;color:${BRAND_COLORS.inkSubtle};text-align:center`,
  footerBrand: `color:${BRAND_COLORS.ink}`,
  footerLink: `color:${BRAND_COLORS.ink}`,
  itemLabel: 'padding:12px 0 0;font-size:16px;line-height:22px',
  itemDetail: `display:block;font-size:13px;line-height:18px;color:${BRAND_COLORS.inkMuted}`,
  itemAmount:
    'padding:12px 0 0;font-size:16px;line-height:22px;font-weight:650;text-align:right;white-space:nowrap;vertical-align:top',
  itemRow: `border-bottom:1px solid ${BRAND_COLORS.border}`,
  total: `padding:12px 0 4px;border-top:2px solid ${BRAND_COLORS.ink};font-size:17px;line-height:24px;font-weight:700`,
  due: 'margin:8px 0 16px;font-size:15px;line-height:22px;font-weight:650',
  pix: `margin:0 0 16px;padding:16px;border-radius:14px;background:${BRAND_COLORS.mintSoft}`,
  qr: `display:block;width:104px;height:104px;border:0;background:${BRAND_COLORS.surface};border-radius:8px`,
  pixTitle: 'margin:0 0 4px;font-size:16px;line-height:22px;font-weight:700',
  pixText: 'margin:0;font-size:14px;line-height:20px',
  codeLabel: `margin:0 0 6px;font-size:13px;line-height:18px;color:${BRAND_COLORS.inkMuted}`,
  code: `margin:0 0 16px;padding:12px;border:1px dashed ${BRAND_COLORS.border};border-radius:10px;font-family:'DejaVu Sans Mono',Menlo,Consolas,monospace;font-size:12px;line-height:18px;word-break:break-all`,
}

export function renderEmail(content: EmailContent): RenderedEmail {
  return { text: renderText(content), html: renderHtml(content) }
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character)
}

function renderText(content: EmailContent): string {
  const { greeting, heading, paragraphs, action, blocks = [], closing, notes, footerLink } = content
  return [
    greeting,
    heading,
    ...paragraphs.map(paragraphText),
    ...blocks.map(blockText),
    closing && paragraphText(closing),
    action && linkText(action),
    ...notes.map(paragraphText),
    footerLink && linkText(footerLink),
  ]
    .filter((block) => block !== undefined && block !== '')
    .join('\n\n')
}

function blockText(block: EmailBlock): string {
  switch (block.kind) {
    case 'items':
      return [
        ...block.rows.map((row) => `${row.label} (${row.detail}): ${row.amount}`),
        `${block.total.label}: ${block.total.amount}`,
      ].join('\n')
    case 'due':
      return block.text
    case 'pix':
      return `${block.title}\n${paragraphText(block.text)}`
    case 'code':
      return `${block.label}\n${block.code}`
  }
}

function linkText(link: EmailLink): string {
  return `${link.label}: ${link.url}`
}

function paragraphText(paragraph: EmailParagraph): string {
  return spansOf(paragraph).map(spanText).join('')
}

function spanText(span: EmailSpan): string {
  if (typeof span === 'string') {
    return span
  }
  if ('strong' in span) {
    return span.strong
  }
  return `${span.link.label} (${span.link.url})`
}

function spansOf(paragraph: EmailParagraph): readonly EmailSpan[] {
  return typeof paragraph === 'string' ? [paragraph] : paragraph
}

function renderHtml(content: EmailContent): string {
  const imagesUrl = new URL(EMAIL_IMAGES_PATH, content.action?.url ?? content.baseUrl)
  const preheader = content.preheader
    ? `<div style="${STYLES.preheader}">${escapeHtml(content.preheader)}</div>`
    : ''
  const rows = [
    `<tr><td style="padding:0 0 16px"><img src="${imageUrl(imagesUrl, LOGO_FILE)}" height="${LOGO_HEIGHT_PX}" alt="${LOGO_ALT}" style="display:block;border:0"></td></tr>`,
    `<tr><td style="${STYLES.card}">${cardHtml(content, imagesUrl)}</td></tr>`,
    `<tr><td style="${STYLES.footer}">${footerHtml(content.reason, content.footerLink)}</td></tr>`,
  ].join('')
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"></head><body style="${STYLES.body}">${preheader}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="${STYLES.outer}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px">${rows}</table></td></tr></table></body></html>`
}

function cardHtml(content: EmailContent, imagesUrl: URL): string {
  const art = content.illustration
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${STYLES.art}"><img src="${imageUrl(imagesUrl, ILLUSTRATION_FILES[content.illustration])}" height="${ILLUSTRATION_HEIGHT_PX}" alt="" style="display:inline-block;border:0"></td></tr></table>`
    : ''
  const greeting = content.greeting
    ? `<p style="${STYLES.greeting}">${escapeHtml(content.greeting)}</p>`
    : ''
  const body = [
    greeting,
    `<h1 style="${STYLES.heading}">${escapeHtml(content.heading)}</h1>`,
    ...content.paragraphs.map(
      (paragraph) => `<p style="${STYLES.paragraph}">${paragraphHtml(paragraph)}</p>`,
    ),
    ...(content.blocks ?? []).map(blockHtml),
    content.closing ? `<p style="${STYLES.paragraph}">${paragraphHtml(content.closing)}</p>` : '',
    content.action ? actionHtml(content.action) : '',
  ].join('')
  const notes = content.notes.map((note) => `<p style="${STYLES.note}">${paragraphHtml(note)}</p>`)
  return `${art}<div style="${STYLES.content}">${body}</div><div style="${STYLES.notes}">${notes.join('')}</div>`
}

function actionHtml(link: EmailLink): string {
  const url = escapeHtml(link.url)
  return [
    `<a href="${url}" style="${STYLES.button}">${escapeHtml(link.label)}</a>`,
    `<p style="${STYLES.fallback}">${FALLBACK_LINE}<br><a href="${url}" style="${STYLES.link}">${url}</a></p>`,
  ].join('')
}

function blockHtml(block: EmailBlock): string {
  switch (block.kind) {
    case 'items':
      return itemsHtml(block)
    case 'due':
      return `<p style="${STYLES.due};color:${block.isPast ? BRAND_COLORS.danger : BRAND_COLORS.ink}">${escapeHtml(block.text)}</p>`
    case 'pix':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${STYLES.pix}"><tr><td width="120" style="vertical-align:top;padding-right:16px"><img src="cid:${escapeHtml(block.qrCid)}" width="104" height="104" alt="QR code do Pix" style="${STYLES.qr}"></td><td style="vertical-align:top"><p style="${STYLES.pixTitle}">${escapeHtml(block.title)}</p><p style="${STYLES.pixText}">${paragraphHtml(block.text)}</p></td></tr></table>`
    case 'code':
      return `<p style="${STYLES.codeLabel}">${escapeHtml(block.label)}</p><p style="${STYLES.code}">${escapeHtml(block.code)}</p>`
  }
}

function itemsHtml(block: Extract<EmailBlock, { kind: 'items' }>): string {
  const rows = block.rows.map(
    (row) =>
      `<tr style="${STYLES.itemRow}"><td style="${STYLES.itemLabel};padding-bottom:12px">${escapeHtml(row.label)}<span style="${STYLES.itemDetail}">${escapeHtml(row.detail)}</span></td><td style="${STYLES.itemAmount};padding-bottom:12px">${escapeHtml(row.amount)}</td></tr>`,
  )
  const total = `<tr><td style="${STYLES.total}">${escapeHtml(block.total.label)}</td><td style="${STYLES.total};text-align:right;white-space:nowrap">${escapeHtml(block.total.amount)}</td></tr>`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 0;border-collapse:collapse">${rows.join('')}${total}</table>`
}

function paragraphHtml(paragraph: EmailParagraph): string {
  return spansOf(paragraph).map(spanHtml).join('')
}

function spanHtml(span: EmailSpan): string {
  if (typeof span === 'string') {
    return escapeHtml(span)
  }
  if ('strong' in span) {
    return `<strong>${escapeHtml(span.strong)}</strong>`
  }
  return `<a href="${escapeHtml(span.link.url)}" style="${STYLES.link}">${escapeHtml(span.link.label)}</a>`
}

function footerHtml(reason: string | undefined, link: EmailLink | undefined): string {
  const brand = `<strong style="${STYLES.footerBrand}">${FOOTER_BRAND}</strong>${FOOTER_SLOGAN}`
  return [
    brand,
    reason && escapeHtml(reason),
    link &&
      `<a href="${escapeHtml(link.url)}" style="${STYLES.footerLink}">${escapeHtml(link.label)}</a>`,
  ]
    .filter(Boolean)
    .join('<br>')
}

function imageUrl(imagesUrl: URL, file: string): string {
  return escapeHtml(new URL(file, imagesUrl).toString())
}

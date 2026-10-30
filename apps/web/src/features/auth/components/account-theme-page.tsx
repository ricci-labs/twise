import { ThemeCards } from '@web/components/inputs/theme-cards'
import { PageFrame } from '@web/components/layout/page-frame'
import { authMessages } from '@web/features/auth/auth.messages'
import type { AccountFormProps, AccountPageProps } from '@web/features/auth/auth.types'
import { AccountGroupFrame } from '@web/features/auth/components/account-group-frame'
import { usePageTitle } from '@web/hooks/use-page-title'
import { applyTheme, storedTheme } from '@web/lib/theme'
import type { ThemeChoice } from '@web/lib/theme.types'
import { useState } from 'react'

const messages = authMessages.myAccount
const copy = messages.theme

export function AccountThemePage({ workspaceId }: AccountPageProps) {
  usePageTitle(copy.pageTitle)
  return (
    <PageFrame edge="bleed">
      <ThemeChooser workspaceId={workspaceId} layout="page" />
    </PageFrame>
  )
}

export function ThemeChooser({ workspaceId, layout }: AccountFormProps) {
  const [theme, setTheme] = useState<ThemeChoice>(storedTheme)
  function choose(next: ThemeChoice) {
    setTheme(next)
    applyTheme(next)
  }
  return (
    <AccountGroupFrame
      layout={layout}
      workspaceId={workspaceId}
      description={copy.cardDescription}
      title={copy.title}
    >
      <div className="flex flex-col gap-2">
        {layout === 'page' && <span className="text-label font-medium text-ink">{copy.label}</span>}
        <ThemeCards label={copy.label} value={theme} onChange={choose} />
        {layout === 'page' && <p className="text-body-sm text-ink-muted">{copy.help}</p>}
      </div>
    </AccountGroupFrame>
  )
}

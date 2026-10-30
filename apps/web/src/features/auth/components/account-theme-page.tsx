import { Link } from '@tanstack/react-router'
import { ThemeCards } from '@web/components/inputs/theme-cards'
import { PageFrame } from '@web/components/layout/page-frame'
import { SettingsFormPage } from '@web/components/layout/settings-form-page'
import { authMessages } from '@web/features/auth/auth.messages'
import type { AccountPageProps } from '@web/features/auth/auth.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { applyTheme, storedTheme } from '@web/lib/theme'
import type { ThemeChoice } from '@web/lib/theme.types'
import { useState } from 'react'

const messages = authMessages.myAccount
const copy = messages.theme

export function AccountThemePage({ workspaceId }: AccountPageProps) {
  usePageTitle(copy.pageTitle)
  const [theme, setTheme] = useState<ThemeChoice>(storedTheme)
  function choose(next: ThemeChoice) {
    setTheme(next)
    applyTheme(next)
  }
  return (
    <PageFrame edge="bleed">
      <SettingsFormPage
        back={<Link to="/w/$workspaceId/account" params={{ workspaceId }} />}
        backLabel={messages.back}
        title={copy.title}
      >
        <div className="flex flex-col gap-2">
          <span className="text-label font-medium text-ink">{copy.label}</span>
          <ThemeCards label={copy.label} value={theme} onChange={choose} />
          <p className="text-body-sm text-ink-muted">{copy.help}</p>
        </div>
      </SettingsFormPage>
    </PageFrame>
  )
}

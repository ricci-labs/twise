import { Link } from '@tanstack/react-router'
import { Card } from '@web/components/display/card'
import { SettingsFormPage } from '@web/components/layout/settings-form-page'
import { authMessages } from '@web/features/auth/auth.messages'
import type { AccountGroupFrameProps } from '@web/features/auth/auth.types'

export function AccountGroupFrame({
  layout,
  workspaceId,
  title,
  description,
  footer,
  className,
  children,
}: AccountGroupFrameProps) {
  if (layout === 'card') {
    return (
      <Card
        title={title}
        description={description}
        className={className}
        footerAction={footer && <span className="ml-auto">{footer}</span>}
      >
        <div className="flex flex-1 flex-col gap-5">{children}</div>
      </Card>
    )
  }
  return (
    <SettingsFormPage
      back={<Link to="/w/$workspaceId/account" params={{ workspaceId }} />}
      backLabel={authMessages.myAccount.back}
      title={title}
      footer={footer}
    >
      {children}
    </SettingsFormPage>
  )
}

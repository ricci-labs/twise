import { Alert } from '@web/components/feedback/alert'
import type { SettingsFormPageProps } from '@web/components/layout/settings-form-page/settings-form-page.types'
import {
  settingsFormPageBodyVariants,
  settingsFormPageFooterVariants,
  settingsFormPageVariants,
} from '@web/components/layout/settings-form-page/settings-form-page.variants'
import { SubPageHeader } from '@web/components/layout/sub-page-header'

export function SettingsFormPage({
  back,
  backLabel,
  title,
  readOnlyNote,
  footer,
  children,
}: SettingsFormPageProps) {
  return (
    <div data-slot="settings-form-page" className={settingsFormPageVariants()}>
      <SubPageHeader back={back} backLabel={backLabel} title={title} />
      <div className={settingsFormPageBodyVariants()}>
        {readOnlyNote && (
          <Alert tone="neutral" icon="lock">
            {readOnlyNote}
          </Alert>
        )}
        {children}
      </div>
      {footer && !readOnlyNote && (
        <div data-slot="settings-form-footer" className={settingsFormPageFooterVariants()}>
          {footer}
        </div>
      )}
    </div>
  )
}

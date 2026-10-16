import { CategoryArt } from '@web/components/display/category-art'
import type { SettingsRowProps } from '@web/components/navigation/settings-row/settings-row.types'
import {
  settingsRowChevronVariants,
  settingsRowDetailVariants,
  settingsRowLinkVariants,
  settingsRowTextVariants,
  settingsRowTitleVariants,
  settingsRowVariants,
} from '@web/components/navigation/settings-row/settings-row.variants'
import { ChevronRight } from 'lucide-react'
import { cloneElement } from 'react'

export function SettingsRow({ title, detail, icon, link }: SettingsRowProps) {
  return (
    <li data-slot="settings-row" className={settingsRowVariants()}>
      {cloneElement(
        link,
        { className: settingsRowLinkVariants() },
        <>
          <CategoryArt name={title} icon={icon} size="list" />
          <span className={settingsRowTextVariants()}>
            <span className={settingsRowTitleVariants()}>{title}</span>
            {detail && <span className={settingsRowDetailVariants()}>{detail}</span>}
          </span>
          <ChevronRight aria-hidden="true" className={settingsRowChevronVariants()} />
        </>,
      )}
    </li>
  )
}

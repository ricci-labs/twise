import { MetaLine } from '@web/components/display/meta-line'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import type { SettingsRowProps } from '@web/components/navigation/settings-row/settings-row.types'
import {
  settingsRowChevronVariants,
  settingsRowDetailVariants,
  settingsRowIconVariants,
  settingsRowLinkVariants,
  settingsRowTextVariants,
  settingsRowTitleVariants,
  settingsRowVariants,
} from '@web/components/navigation/settings-row/settings-row.variants'
import { ChevronRight } from 'lucide-react'
import { cloneElement } from 'react'

export function SettingsRow({
  title,
  detail,
  icon,
  link,
  variant,
  isLocked = false,
}: SettingsRowProps) {
  return (
    <li data-slot="settings-row" className={settingsRowVariants({ variant })}>
      {cloneElement(
        link,
        { className: settingsRowLinkVariants() },
        <>
          {icon && (
            <span
              aria-hidden="true"
              data-slot="settings-row-icon"
              className={settingsRowIconVariants()}
            >
              {icon}
            </span>
          )}
          <span className={settingsRowTextVariants()}>
            <span className={settingsRowTitleVariants()}>{title}</span>
            {detail && (
              <span className={settingsRowDetailVariants()}>
                <MetaLine text={detail} />
              </span>
            )}
          </span>
          {isLocked ? (
            <TwiseIcon name="lock" size="sm" className={settingsRowChevronVariants()} />
          ) : (
            <ChevronRight aria-hidden="true" className={settingsRowChevronVariants()} />
          )}
        </>,
      )}
    </li>
  )
}

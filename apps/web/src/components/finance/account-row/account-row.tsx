import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import type { AccountRowProps } from '@web/components/finance/account-row/account-row.types'
import {
  accountRowActionsVariants,
  accountRowDetailVariants,
  accountRowFirstLineVariants,
  accountRowMainVariants,
  accountRowNameVariants,
  accountRowTextVariants,
  accountRowValueVariants,
  accountRowVariants,
} from '@web/components/finance/account-row/account-row.variants'
import { ColorSwatch } from '@web/components/inputs/color-swatch'
import { cloneElement } from 'react'

export function AccountRow({
  name,
  icon,
  color,
  detail,
  amountCents = null,
  isArchived = false,
  isHighlighted = false,
  link,
  actions,
}: AccountRowProps) {
  const className = accountRowMainVariants({ isArchived })
  const content = (
    <>
      <CategoryArt name={name} icon={icon} size="list" />
      <span className={accountRowTextVariants()}>
        <span className={accountRowFirstLineVariants()}>
          <span className={accountRowNameVariants()}>
            <span>{name}</span>
            <ColorSwatch color={color} />
          </span>
          {amountCents !== null && (
            <span className={accountRowValueVariants()}>
              <Amount cents={amountCents} size="inherit" />
            </span>
          )}
        </span>
        <span className={accountRowDetailVariants()}>{detail}</span>
      </span>
    </>
  )
  return (
    <li data-slot="account-row" className={accountRowVariants({ isHighlighted })}>
      {link ? (
        cloneElement(link, { className }, content)
      ) : (
        <div className={className}>{content}</div>
      )}
      {actions && <div className={accountRowActionsVariants()}>{actions}</div>}
    </li>
  )
}

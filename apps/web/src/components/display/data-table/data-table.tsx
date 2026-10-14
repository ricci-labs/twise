import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import type {
  DataTableAmountProps,
  DataTableNameProps,
  DataTableProps,
} from '@web/components/display/data-table/data-table.types'
import {
  dataTableAmountVariants,
  dataTableCellVariants,
  dataTableHeadCellVariants,
  dataTableNameDetailVariants,
  dataTableNameLabelVariants,
  dataTableNameTextVariants,
  dataTableNameVariants,
  dataTableRowVariants,
  dataTableVariants,
} from '@web/components/display/data-table/data-table.variants'
import { ColorSwatch } from '@web/components/inputs/color-swatch'
import { cloneElement } from 'react'

export function DataTable({ label, layout, columns, rows }: DataTableProps) {
  return (
    <table data-slot="data-table" aria-label={label} className={dataTableVariants()}>
      <thead>
        <tr className={dataTableRowVariants({ layout, isHead: true })}>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={dataTableHeadCellVariants({ layout, align: column.align })}
            >
              {column.isLabelHidden ? (
                <span className="sr-only">{column.label}</span>
              ) : (
                column.label
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className={dataTableRowVariants({ layout, isOpen: row.isOpen })}>
            {row.cells.map((cell, position) => (
              <td
                key={columns[position]?.key ?? position}
                className={dataTableCellVariants({
                  align: columns[position]?.align,
                  isActions: columns[position]?.isActions,
                })}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function DataTableName({ name, icon, color = null, detail, link }: DataTableNameProps) {
  const content = (
    <>
      <CategoryArt name={name} icon={icon} size="row" />
      <span className={dataTableNameTextVariants()}>
        <span className={dataTableNameLabelVariants()}>{name}</span>
        {detail && <span className={dataTableNameDetailVariants()}>{detail}</span>}
      </span>
      <ColorSwatch color={color} />
    </>
  )
  if (!link) {
    return (
      <span data-slot="data-table-name" className={dataTableNameVariants()}>
        {content}
      </span>
    )
  }
  return cloneElement(
    link,
    { 'data-slot': 'data-table-name', className: dataTableNameVariants() },
    content,
  )
}

export function DataTableAmount({ cents }: DataTableAmountProps) {
  return (
    <span className={dataTableAmountVariants()}>
      <Amount cents={cents} size="inherit" />
    </span>
  )
}

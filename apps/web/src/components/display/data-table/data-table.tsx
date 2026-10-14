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
              className={dataTableHeadCellVariants({ align: column.align })}
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
          <tr key={row.key} className={dataTableRowVariants({ layout })}>
            {row.cells.map((cell, position) => (
              <td
                key={columns[position]?.key ?? position}
                className={dataTableCellVariants({ align: columns[position]?.align })}
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

export function DataTableName({ name, icon, color = null, link }: DataTableNameProps) {
  const content = (
    <>
      <CategoryArt name={name} icon={icon} size="row" />
      <span className={dataTableNameTextVariants()}>{name}</span>
      <ColorSwatch color={color} />
    </>
  )
  if (!link) {
    return <span className={dataTableNameVariants()}>{content}</span>
  }
  return cloneElement(link, { className: dataTableNameVariants() }, content)
}

export function DataTableAmount({ cents }: DataTableAmountProps) {
  return (
    <span className={dataTableAmountVariants()}>
      <Amount cents={cents} size="inherit" />
    </span>
  )
}

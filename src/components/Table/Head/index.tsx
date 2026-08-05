"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import React from "react";
import { useTableSort } from "../context";
import { TableHeadProps } from "./interface";
import {
  tableHeadAlignStyle,
  tableHeadStyle,
  tableSortActiveIconStyle,
  tableSortActiveStyle,
  tableSortButtonStyle,
  tableSortIdleIconStyle,
} from "./style";

const ICON_SIZE = 13;

/**
 * Célula de cabeçalho. Com `sortKey` — e um `Table.Root sort={...}` acima —
 * vira um botão que ordena a lista INTEIRA pela coluna (o pedido vai ao
 * backend), não só as linhas da página aberta.
 *
 * @example
 * <Table.Head sortKey="client_name">Cliente</Table.Head>
 * <Table.Head sortKey="total_amount" sortFirst="desc" align="right">Valor</Table.Head>
 */
export const Head = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      className,
      align = "left",
      sortKey,
      sortFirst = "asc",
      children,
      ...props
    },
    ref
  ) => {
    const sort = useTableSort();
    const sortable = Boolean(sortKey) && sort !== null;
    const isActive = sortable && sort!.key === sortKey;
    const direction = isActive ? sort!.direction : null;

    return (
      <th
        ref={ref}
        // Sem isto o leitor de tela anuncia um botão sem dizer o que ele já fez
        // com a lista. O "none" nas demais colunas ordenáveis é o que informa
        // que elas ordenam, mas não estão ordenando agora.
        aria-sort={
          !sortable
            ? undefined
            : direction === "asc"
              ? "ascending"
              : direction === "desc"
                ? "descending"
                : "none"
        }
        className={cn(tableHeadStyle, tableHeadAlignStyle[align], className)}
        {...props}
      >
        {sortable ? (
          <button
            type="button"
            onClick={() => sort!.onSort(sortKey!, sortFirst)}
            className={cn(
              tableSortButtonStyle,
              isActive && tableSortActiveStyle
            )}
          >
            {children}
            {direction === "asc" ? (
              <ArrowUp size={ICON_SIZE} className={tableSortActiveIconStyle} />
            ) : direction === "desc" ? (
              <ArrowDown
                size={ICON_SIZE}
                className={tableSortActiveIconStyle}
              />
            ) : (
              <ChevronsUpDown
                size={ICON_SIZE}
                className={tableSortIdleIconStyle}
              />
            )}
          </button>
        ) : (
          children
        )}
      </th>
    );
  }
);

Head.displayName = "Table.Head";

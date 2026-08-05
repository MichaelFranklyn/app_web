"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { TableSortContext } from "../context";
import { TableSort } from "../interface";
import { tableRootStyle } from "./style";

export interface TableRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Ordenação da lista, vinda de `useTableData().sort`. Sem ela nenhum
   * `Table.Head` ordena: `sortKey` é ignorado e a coluna fica um cabeçalho
   * comum — é o que mantém intactas as tabelas que não pediram ordenação.
   */
  sort?: TableSort;
}

export const Root = React.forwardRef<HTMLDivElement, TableRootProps>(
  ({ className, sort, children, ...props }, ref) => {
    const root = (
      <div ref={ref} className={cn(tableRootStyle, className)} {...props}>
        {children}
      </div>
    );

    if (!sort) return root;

    return (
      <TableSortContext.Provider value={sort}>{root}</TableSortContext.Provider>
    );
  }
);

Root.displayName = "Table.Root";

"use client";

import { createContext, useContext } from "react";
import { TableSort } from "./interface";

/**
 * Ordenação publicada pelo `Table.Root` e consumida por cada `Table.Head`
 * ordenável.
 *
 * Vai por contexto porque a alternativa — repetir o par `sort`/`onSort` em toda
 * coluna — multiplicaria as mesmas duas props por nove cabeçalhos numa tabela
 * como a de pedidos, e bastaria esquecer uma para a coluna parar de ordenar em
 * silêncio.
 */
export const TableSortContext = createContext<TableSort | null>(null);

export const useTableSort = () => useContext(TableSortContext);

import { FilterField } from "@/components/Filters";
import { TableSort } from "@/components/Table";
import { Client } from "../../interface";

export interface ClientsTableProps {
  items: Client[];
  /** Campos do painel "Filtros" (vendedor, estado, cadastro). */
  filterFields: FilterField[];
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  /** Aplica várias chaves de uma vez — é o que o painel de filtros usa. */
  setFilters: (patch: Record<string, string | undefined>) => void;
  /** Ordenação da lista — vem do `useTableData` e desce até cada cabeçalho. */
  sort: TableSort;
  loading: boolean;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

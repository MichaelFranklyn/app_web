import { FilterField } from "@/components/Filters";
import { TableSort } from "@/components/Table";
import { PlatformTenant } from "../../interface";

export interface TenantsTableProps {
  items: PlatformTenant[];
  inputValues: Record<string, string>;
  // Assinaturas idênticas às do `useTableData`: `undefined` é como o painel de
  // filtros diz "limpa esta chave", e estreitar para `string` faria a limpeza
  // não compilar.
  setFilter: (key: string, value: string | undefined) => void;
  setFilters: (patch: Record<string, string | undefined>) => void;
  sort: TableSort;
  filterFields: FilterField[];
  loading: boolean;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

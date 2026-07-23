import { SelectOption } from "@/components/Input";
import { Client } from "../../interface";

export interface ClientsTableProps {
  items: Client[];
  /** Vendedores para o filtro do gestor; `null` esconde o filtro (vendedor logado). */
  sellerOptions: SelectOption[] | null;
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  loading: boolean;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

import { Client } from "../../interface";

export interface ClientsTableProps {
  items: Client[];
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  loading: boolean;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

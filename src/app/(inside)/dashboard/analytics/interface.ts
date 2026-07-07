// Filtros compartilhados por todos os gráficos da aba (escopam via query própria).
export interface ChartFilters {
  from: string;
  to: string;
  sellerId: string | null;
}

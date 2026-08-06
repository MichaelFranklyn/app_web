"use client";

import { useLocalTable } from "@/hooks/useLocalTable";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { formatPercent } from "../../utils";
import { ReportFilters, ReportKpi } from "../interface";
import { useLocalReportPage } from "../useLocalReportPage";
import { safeRate } from "../utils";
import { FACTORY_ORDERS_REPORT_QUERY } from "./gql";
import { FactoryOrdersResponse, FactoryOrdersRow } from "./interface";
import {
  FACTORIES_FILTER_FIELDS,
  useFactoriesFilters,
} from "./useFactoriesFilters";
import { FACTORIES_SORT_COLUMNS, buildFactoryOption, sumBy } from "./utils";

export const FACTORIES_PER_PAGE = 25;

const EMPTY_ROWS: FactoryOrdersRow[] = [];

/**
 * De quem se vendeu no período: uma linha por fábrica.
 *
 * O recorte é pela data do PEDIDO e só o que virou pedido de verdade
 * (confirmado, faturado ou entregue) — a mesma definição da aba "Pedidos
 * enviados", porque a pergunta é a mesma vista pelo outro lado: lá por pedido,
 * aqui por fábrica.
 *
 * Os KPIs saem das linhas, não de uma segunda consulta: o backend já devolveu
 * o conjunto completo, e somar de novo no servidor abriria a porta para os dois
 * números divergirem.
 *
 * Filtro, ordenação e paginação são locais, e é a lista JÁ filtrada e ordenada
 * que vai para o XLSX/PDF.
 */
export const useFactoriesReport = (filters: ReportFilters) => {
  const { data, loading, error, refetch } = useQuery<FactoryOrdersResponse>(
    FACTORY_ORDERS_REPORT_QUERY,
    {
      variables: {
        from: filters.from,
        to: filters.to,
        sellerId: filters.sellerId,
      },
    }
  );
  useQueryErrorToast(error, "Não foi possível carregar as fábricas.");

  const allRows = data?.factoryOrdersReport ?? EMPTY_ROWS;

  const table = useLocalTable<FactoryOrdersRow>({
    items: allRows,
    columns: FACTORIES_SORT_COLUMNS,
    fields: FACTORIES_FILTER_FIELDS,
  });

  const filterFields = useFactoriesFilters(allRows);
  const rows = table.displayedData;

  const { currentPage, setCurrentPage, totalPages, pageRows } =
    useLocalReportPage(rows, FACTORIES_PER_PAGE);

  // Os cartões e o gráfico falam do PERÍODO INTEIRO, não do recorte à vista:
  // filtrar por uma fábrica muda a tabela, e o topo tem de continuar dizendo de
  // que tamanho é o mês — senão o filtro parece encolher o faturamento.
  const kpis: ReportKpi[] = useMemo(() => {
    const total = sumBy(allRows, (row) => row.totalAmount);
    const invoiced = sumBy(allRows, (row) => row.invoicedAmount);
    const orders = sumBy(allRows, (row) => row.orderCount);
    const leader = allRows[0];
    return [
      {
        label: "Fábricas com pedido",
        value: String(allRows.length),
        hint: `${orders} pedido(s) no período`,
        status: "neutral",
      },
      {
        label: "Valor colocado",
        value: formatMoney(total),
        hint: "soma dos pedidos enviados às fábricas",
        status: "ok",
      },
      {
        label: "Já faturado",
        value: formatMoney(invoiced),
        hint:
          total > 0
            ? `${formatPercent(safeRate(invoiced, total))} do que foi colocado`
            : "nada faturado ainda",
        status: "atencao",
      },
      {
        // A concentração é o risco da representação: uma fábrica com metade da
        // receita é meia empresa dependendo de um contrato.
        label: "Maior fábrica",
        value: leader ? formatPercent(leader.share) : "—",
        hint: leader ? leader.entityName : "sem pedidos no período",
        status: leader && leader.share >= 0.5 ? "urgente" : "neutral",
      },
    ];
  }, [allRows]);

  const fetchAllRows = useCallback(
    async (): Promise<FactoryOrdersRow[]> => rows,
    [rows]
  );

  return {
    kpis,
    kpisLoading: loading && allRows.length === 0,
    chart: {
      option: buildFactoryOption(allRows),
      hasData: allRows.length > 0,
      loading,
      error,
      refetch: () => void refetch(),
    },
    filterFields,
    inputValues: table.inputValues,
    setFilter: table.setFilter,
    setFilters: table.setFilters,
    sort: table.sort,
    rows,
    pageRows,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    fetchAllRows,
    hasRows: rows.length > 0,
  };
};

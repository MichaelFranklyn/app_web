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
import { CLIENT_ABC_CURVE_QUERY } from "./gql";
import { AbcCurveResponse, AbcRow } from "./interface";
import { ABC_FILTER_FIELDS, useAbcFilters } from "./useAbcFilters";
import {
  ABC_SORT_COLUMNS,
  buildCurveOption,
  summarizeByClass,
  sumBy,
} from "./utils";

export const ABC_PER_PAGE = 25;

const EMPTY_ROWS: AbcRow[] = [];

/**
 * A curva ABC dos clientes: quem sustenta o faturamento do período.
 *
 * Filtro, ordenação e paginação são locais (a curva vem inteira), e é a lista JÁ
 * filtrada e ordenada que vai para o XLSX/PDF.
 *
 * Os KPIs falam da curva INTEIRA mesmo quando a tabela mostra uma classe só —
 * a pergunta do relatório é de concentração ("quantos clientes seguram 80% do
 * meu faturamento?"), e ela se responde com o todo. O recorte por classe serve
 * para trabalhar a lista depois de lida a concentração.
 */
export const useAbcReport = (filters: ReportFilters) => {
  const { data, loading, error, refetch } = useQuery<AbcCurveResponse>(
    CLIENT_ABC_CURVE_QUERY,
    {
      variables: {
        from: filters.from,
        to: filters.to,
        sellerId: filters.sellerId,
      },
    }
  );
  useQueryErrorToast(error, "Não foi possível carregar a curva ABC.");

  const allRows = data?.clientAbcCurve ?? EMPTY_ROWS;

  const table = useLocalTable<AbcRow>({
    items: allRows,
    columns: ABC_SORT_COLUMNS,
    fields: ABC_FILTER_FIELDS,
  });

  const filterFields = useAbcFilters();
  const rows = table.displayedData;

  const { currentPage, setCurrentPage, totalPages, pageRows } =
    useLocalReportPage(rows, ABC_PER_PAGE);

  const kpis: ReportKpi[] = useMemo(() => {
    const totals = summarizeByClass(allRows);
    const total = sumBy(allRows, (row) => row.totalAmount);
    const classAShare = safeRate(totals.A.amount, total);
    const classAClientShare = safeRate(totals.A.clients, allRows.length);
    return [
      {
        label: "Clientes que faturaram",
        value: String(allRows.length),
        hint: formatMoney(total),
        status: "neutral",
      },
      {
        // A leitura de concentração: poucos clientes segurando muito é risco,
        // não mérito — se um deles sai, sai o mês junto.
        label: "Classe A",
        value: String(totals.A.clients),
        hint: `${formatPercent(classAClientShare)} dos clientes fazem ${formatPercent(classAShare)} do faturamento`,
        status: classAClientShare <= 0.2 ? "urgente" : "ok",
      },
      {
        label: "Classe B",
        value: String(totals.B.clients),
        hint: formatMoney(totals.B.amount),
        status: "atencao",
      },
      {
        label: "Classe C",
        value: String(totals.C.clients),
        hint: `${formatMoney(totals.C.amount)} — a cauda da curva`,
        status: "neutral",
      },
    ];
  }, [allRows]);

  const fetchAllRows = useCallback(async (): Promise<AbcRow[]> => rows, [rows]);

  return {
    kpis,
    kpisLoading: loading && allRows.length === 0,
    chart: {
      option: buildCurveOption(allRows),
      hasData: allRows.length > 0,
      loading,
      error,
      refetch: () => void refetch(),
    },
    allRows,
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

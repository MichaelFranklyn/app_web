"use client";

import { formatMoney } from "@/utils/format/masks";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { AbcReportTable } from "./_components/AbcReportTable";
import { ABC_PDF_COLUMNS } from "./pdfColumns";
import { useAbcReport } from "./useAbcReport";
import {
  ABC_EXPORT_HEADERS,
  buildAbcExportRows,
  CURVE_CHART_LIMIT,
  summarizeByClass,
  sumBy,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function AbcReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const {
    kpis,
    kpisLoading,
    chart,
    allRows,
    rows,
    pageRows,
    scope,
    setScope,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    fetchAllRows,
    hasRows,
  } = useAbcReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "curva-abc",
    title: "Curva ABC de clientes",
    from: filters.from,
    context,
    fetchRows: fetchAllRows,
    sheetHeaders: ABC_EXPORT_HEADERS,
    buildSheetRows: buildAbcExportRows,
    pdfColumns: ABC_PDF_COLUMNS,
    buildKpis: (exported) => {
      const totals = summarizeByClass(exported);
      return [
        { label: "Clientes", value: String(exported.length) },
        { label: "Classe A", value: String(totals.A.clients) },
        { label: "Classe B", value: String(totals.B.clients) },
        {
          label: "Faturamento",
          value: formatMoney(sumBy(exported, (row) => row.totalAmount)),
        },
      ];
    },
    buildHighlight: (exported) =>
      `${exported.length} cliente(s) · ${formatMoney(sumBy(exported, (row) => row.totalAmount))}`,
    buildTotals: (exported) => ({
      label: "TOTAL",
      byColumn: {
        3: formatMoney(sumBy(exported, (row) => row.totalAmount)),
        7: formatMoney(sumBy(exported, (row) => row.commissionAmount)),
      },
    }),
  });

  return (
    <div className="flex flex-col gap-12">
      <ReportToolbar
        filters={filters}
        onRangeChange={setRange}
        onSellerChange={setSellerId}
        canSelectSeller={canSelectSeller}
        onExportSheet={exportSheet}
        onExportPdf={exportPdf}
        exportDisabled={!hasRows}
      />

      <ReportKpis items={kpis} loading={kpisLoading} />

      <ReportChartCard
        title="Curva de Pareto"
        description={
          allRows.length > CURVE_CHART_LIMIT
            ? `Barra: o que cada cliente faturou. Linha: o acumulado. Os ${CURVE_CHART_LIMIT} maiores no gráfico; a lista completa está na tabela.`
            : "Barra: o que cada cliente faturou. Linha: o acumulado — onde ela cruza os 80% está a classe A."
        }
        option={chart.option}
        hasData={chart.hasData}
        loading={chart.loading}
        error={chart.error}
        onRetry={chart.refetch}
      />

      <AbcReportTable
        items={pageRows}
        loading={loading}
        scope={scope}
        onScopeChange={setScope}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        totalItems={rows.length}
      />
    </div>
  );
}
